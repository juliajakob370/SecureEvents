using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserManagementService.Data;
using UserManagementService.Models;
using UserManagementService.Services;

namespace UserManagementService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private const int LockoutThreshold = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(5);
    private readonly UserDbContext _context;
    private readonly LoggingClient _loggingClient;
    private readonly VerificationCodeConsoleLogger _verificationCodeConsoleLogger;
    private readonly IConfiguration _configuration;

    public UsersController(
        UserDbContext context,
        LoggingClient loggingClient,
        VerificationCodeConsoleLogger verificationCodeConsoleLogger,
        IConfiguration configuration)
    {
        _context = context;
        _loggingClient = loggingClient;
        _verificationCodeConsoleLogger = verificationCodeConsoleLogger;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [EnableRateLimiting("CodeRequests")]
    public async Task<IActionResult> RequestLoginCode([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(x => !x.IsDeleted && x.Email.ToLower() == email);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (user.IsSuspended)
        {
            // OWASP A01 FIXED: Suspended accounts are blocked from authentication flows.
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Account suspended" });
        }

        var code = BuildCode();
        _context.VerificationCodes.Add(new VerificationCode
        {
            Email = email,
            Code = code,
            Type = "login",
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });
        await _context.SaveChangesAsync();

        _verificationCodeConsoleLogger.Log("login", email, code);
        await _loggingClient.LogAsync("login-code-requested", $"Code requested for {email}");

        // A01 FIXED: No user data exposure.
        // A09 FIXED: Action written to centralized logging service.
        // A02 FIXED: Verification code stays in backend console only.
        return Ok(new { message = "Login code generated. Check backend console." });
    }

    [HttpPost("verify-login")]
    public async Task<IActionResult> VerifyLogin([FromBody] VerifyLoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var lockCheck = await EnsureNotLockedOutAsync(email, "login");
        if (lockCheck != null)
        {
            return lockCheck;
        }

        var verification = await _context.VerificationCodes
            .Where(x => x.Email == email && x.Type == "login" && !x.IsUsed)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (verification == null || verification.ExpiresAt < DateTime.UtcNow || verification.Code != request.Code)
        {
            await RegisterVerificationFailureAsync(email, "login");
            return BadRequest(new { message = "Invalid code" });
        }

        await ResetVerificationFailuresAsync(email, "login");

        var user = await _context.Users.FirstAsync(x => !x.IsDeleted && x.Email.ToLower() == email);
        if (user.IsSuspended)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Account suspended" });
        }

        verification.IsUsed = true;
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var refreshToken = await IssueRefreshTokenAsync(user.Id);
        WriteAuthCookies(token, refreshToken);

        await _loggingClient.LogAsync("login-success", $"User {email} logged in");

        return Ok(new
        {
            message = "Login verified",
            user = new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.Role)
        });
    }

    [HttpPost("signup")]
    [EnableRateLimiting("CodeRequests")]
    public async Task<IActionResult> RequestSignupCode([FromBody] SignupRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await _context.Users.AnyAsync(x => !x.IsDeleted && x.Email.ToLower() == email);

        if (exists)
        {
            return Conflict(new { message = "Email already registered" });
        }

        var code = BuildCode();
        _context.VerificationCodes.Add(new VerificationCode
        {
            Email = email,
            Code = code,
            Type = "signup",
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });
        await _context.SaveChangesAsync();

        _verificationCodeConsoleLogger.Log("signup", email, code);
        await _loggingClient.LogAsync("signup-code-requested", $"Code requested for {email}");
        return Ok(new { message = "Signup code generated. Check backend console." });
    }

    [HttpPost("verify-signup")]
    public async Task<IActionResult> VerifySignup([FromBody] VerifySignupRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var lockCheck = await EnsureNotLockedOutAsync(email, "signup");
        if (lockCheck != null)
        {
            return lockCheck;
        }

        var verification = await _context.VerificationCodes
            .Where(x => x.Email == email && x.Type == "signup" && !x.IsUsed)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (verification == null || verification.ExpiresAt < DateTime.UtcNow || verification.Code != request.Code)
        {
            await RegisterVerificationFailureAsync(email, "signup");
            return BadRequest(new { message = "Invalid code" });
        }

        await ResetVerificationFailuresAsync(email, "signup");

        var adminEmails = _configuration.GetSection("Admin:Emails").Get<string[]>() ?? Array.Empty<string>();
        var user = new User
        {
            FirstName = verification.FirstName ?? string.Empty,
            LastName = verification.LastName ?? string.Empty,
            Email = email,
            Role = adminEmails.Any(x => string.Equals(x.Trim(), email, StringComparison.OrdinalIgnoreCase)) ? "Admin" : "User"
        };

        verification.IsUsed = true;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var refreshToken = await IssueRefreshTokenAsync(user.Id);
        WriteAuthCookies(token, refreshToken);

        await _loggingClient.LogAsync("signup-success", $"User {email} created");

        return Ok(new
        {
            message = "Signup verified",
            user = new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.Role)
        });
    }

    [Authorize(Policy = "OwnerOrAdmin")]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        if (user.IsSuspended)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Account suspended" });
        }

        // A02 FIXED: Sensitive fields are not returned.
        return Ok(new { user = new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.Role) });
    }

    [Authorize(Policy = "OwnerOrAdmin")]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest request)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var firstName = request.FirstName.Trim();
        var lastName = request.LastName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName) || string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { message = "First name, last name, and email are required." });
        }

        if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase))
        {
            var emailExists = await _context.Users.AnyAsync(x => !x.IsDeleted && x.Id != userId && x.Email.ToLower() == email);
            if (emailExists)
            {
                return Conflict(new { message = "Email is already in use." });
            }

            if (string.IsNullOrWhiteSpace(request.OldEmailCode) || string.IsNullOrWhiteSpace(request.NewEmailCode))
            {
                return BadRequest(new { message = "Email change requires verification codes for old and new email." });
            }

            var oldEmailVerification = await _context.VerificationCodes
                .Where(x => x.Email == user.Email && x.Type == "email-change-old" && !x.IsUsed && x.FirstName == email)
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            var newEmailVerification = await _context.VerificationCodes
                .Where(x => x.Email == email && x.Type == "email-change-new" && !x.IsUsed && x.FirstName == user.Email)
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            if (oldEmailVerification == null ||
                newEmailVerification == null ||
                oldEmailVerification.ExpiresAt < DateTime.UtcNow ||
                newEmailVerification.ExpiresAt < DateTime.UtcNow ||
                oldEmailVerification.Code != request.OldEmailCode ||
                newEmailVerification.Code != request.NewEmailCode)
            {
                return BadRequest(new { message = "Invalid email-change verification codes." });
            }

            oldEmailVerification.IsUsed = true;
            newEmailVerification.IsUsed = true;
        }

        // A03 FIXED: EF Core LINQ update avoids SQL injection-prone raw SQL.
        // A05 FIXED: Server-side validation is applied before updating profile data.
        user.FirstName = firstName;
        user.LastName = lastName;
        user.Email = email;

        await _context.SaveChangesAsync();
        await _loggingClient.LogAsync("profile-updated", $"User {user.Email} updated profile");

        return Ok(new
        {
            message = "Profile updated",
            user = new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.Role)
        });
    }

    [Authorize(Policy = "OwnerOrAdmin")]
    [HttpPost("email-change/request-codes")]
    [EnableRateLimiting("CodeRequests")]
    public async Task<IActionResult> RequestEmailChangeCodes([FromBody] RequestEmailChangeCodesRequest request)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId && !x.IsDeleted);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var newEmail = request.NewEmail.Trim().ToLowerInvariant();

        if (string.Equals(user.Email, newEmail, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "New email must be different from current email." });
        }

        var emailExists = await _context.Users.AnyAsync(x => !x.IsDeleted && x.Id != userId && x.Email.ToLower() == newEmail);
        if (emailExists)
        {
            return Conflict(new { message = "New email is already in use." });
        }

        var oldEmailCode = BuildCode();
        var newEmailCode = BuildCode();

        _context.VerificationCodes.Add(new VerificationCode
        {
            Email = user.Email,
            Code = oldEmailCode,
            Type = "email-change-old",
            FirstName = newEmail,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });

        _context.VerificationCodes.Add(new VerificationCode
        {
            Email = newEmail,
            Code = newEmailCode,
            Type = "email-change-new",
            FirstName = user.Email,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });

        await _context.SaveChangesAsync();

        _verificationCodeConsoleLogger.Log("email-change-old", user.Email, oldEmailCode);
        _verificationCodeConsoleLogger.Log("email-change-new", newEmail, newEmailCode);
        await _loggingClient.LogAsync("email-change-code-requested", $"User {user.Email} requested email change to {newEmail}");

        return Ok(new { message = "Email change codes generated. Check backend console for old and new email codes." });
    }

    [Authorize(Policy = "OwnerOrAdmin")]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(claim, out var userId))
        {
            // OWASP A07 FIXED: Revoke refresh tokens on logout to invalidate future session refresh.
            var tokens = await _context.RefreshTokens.Where(x => x.UserId == userId && !x.IsRevoked).ToListAsync();
            foreach (var token in tokens)
            {
                token.IsRevoked = true;
            }

            await _context.SaveChangesAsync();
        }

        ClearAuthCookies();

        return Ok(new { message = "Logged out" });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var refreshTokenValue = string.IsNullOrWhiteSpace(request.RefreshToken)
            ? Request.Cookies["securevents_refresh_token"]
            : request.RefreshToken;

        if (string.IsNullOrWhiteSpace(refreshTokenValue))
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        // OWASP A07 FIXED: Refresh token rotation + revocation adds server-side session control.
        var existing = await _context.RefreshTokens
            .Where(x => x.Token == refreshTokenValue && !x.IsRevoked)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (existing == null || existing.ExpiresAt < DateTime.UtcNow)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == existing.UserId && !x.IsDeleted);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid refresh token" });
        }

        if (user.IsSuspended)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Account suspended" });
        }

        existing.IsRevoked = true;
        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = await IssueRefreshTokenAsync(user.Id);
        WriteAuthCookies(newAccessToken, newRefreshToken);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Session refreshed" });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> AdminListUsers()
    {
        // OWASP A01 FIXED: Admin-only user management endpoint.
        var users = await _context.Users
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new AdminUserResponse(x.Id, x.FirstName, x.LastName, x.Email, x.Role, x.IsSuspended, x.CreatedAt))
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/{id:int}/suspend")]
    public async Task<IActionResult> AdminSuspendUser(int id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (user == null)
        {
            return NotFound();
        }

        if (user.Role == "Admin")
        {
            return BadRequest(new { message = "Cannot suspend an admin account." });
        }

        user.IsSuspended = true;

        var tokens = await _context.RefreshTokens.Where(x => x.UserId == id && !x.IsRevoked).ToListAsync();
        foreach (var token in tokens)
        {
            token.IsRevoked = true;
        }

        await _context.SaveChangesAsync();
        await _loggingClient.LogAsync("admin-user-suspended", $"Admin suspended user {user.Email}");

        return Ok(new { message = "User suspended" });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("admin/{id:int}/unsuspend")]
    public async Task<IActionResult> AdminUnsuspendUser(int id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (user == null)
        {
            return NotFound();
        }

        user.IsSuspended = false;
        await _context.SaveChangesAsync();
        await _loggingClient.LogAsync("admin-user-unsuspended", $"Admin unsuspended user {user.Email}");

        return Ok(new { message = "User unsuspended" });
    }

    [Authorize(Policy = "OwnerOrAdmin")]
    [HttpPost("payment/send-code")]
    [EnableRateLimiting("CodeRequests")]
    public async Task<IActionResult> SendPaymentCode()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var code = BuildCode();
        _context.VerificationCodes.Add(new VerificationCode
        {
            Email = user.Email,
            Code = code,
            Type = "payment",
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        });

        await _context.SaveChangesAsync();

        _verificationCodeConsoleLogger.Log("payment", user.Email, code);
        await _loggingClient.LogAsync("payment-code-requested", $"Payment code requested for {user.Email}");

        return Ok(new { message = "Payment verification code generated. Check backend console." });
    }

    [Authorize(Policy = "OwnerOrAdmin")]
    [HttpPost("payment/verify-code")]
    public async Task<IActionResult> VerifyPaymentCode([FromBody] VerifyPaymentCodeRequest request)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var verification = await _context.VerificationCodes
            .Where(x => x.Email == user.Email && x.Type == "payment" && !x.IsUsed)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        var lockCheck = await EnsureNotLockedOutAsync(user.Email, "payment");
        if (lockCheck != null)
        {
            return lockCheck;
        }

        if (verification == null || verification.ExpiresAt < DateTime.UtcNow || verification.Code != request.Code)
        {
            await RegisterVerificationFailureAsync(user.Email, "payment");
            return BadRequest(new { message = "Invalid payment verification code" });
        }

        await ResetVerificationFailuresAsync(user.Email, "payment");

        // A03 FIXED: EF Core query/updates are used; no raw SQL.
        verification.IsUsed = true;
        await _context.SaveChangesAsync();
        await _loggingClient.LogAsync("payment-code-verified", $"Payment code verified for {user.Email}");

        return Ok(new { message = "Payment verification successful" });
    }

    private static string BuildCode() => Random.Shared.Next(100000, 999999).ToString();

    private async Task<string> IssueRefreshTokenAsync(int userId)
    {
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return token;
    }

    private async Task<IActionResult?> EnsureNotLockedOutAsync(string email, string type)
    {
        var state = await _context.VerificationAttempts
            .FirstOrDefaultAsync(x => x.Email == email && x.Type == type);

        if (state?.LockedUntil.HasValue == true && state.LockedUntil.Value > DateTime.UtcNow)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new
            {
                message = $"Too many invalid attempts. Try again at {state.LockedUntil.Value:O}."
            });
        }

        return null;
    }

    private async Task RegisterVerificationFailureAsync(string email, string type)
    {
        var state = await _context.VerificationAttempts
            .FirstOrDefaultAsync(x => x.Email == email && x.Type == type);

        if (state == null)
        {
            state = new VerificationAttempt
            {
                Email = email,
                Type = type,
                FailedAttempts = 1,
                UpdatedAt = DateTime.UtcNow
            };
            _context.VerificationAttempts.Add(state);
        }
        else
        {
            state.FailedAttempts += 1;
            state.UpdatedAt = DateTime.UtcNow;
            if (state.FailedAttempts >= LockoutThreshold)
            {
                // OWASP A04/A07 FIXED: lockout cooldown slows brute-force OTP/code guessing.
                state.LockedUntil = DateTime.UtcNow.Add(LockoutDuration);
                state.FailedAttempts = 0;
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task ResetVerificationFailuresAsync(string email, string type)
    {
        var state = await _context.VerificationAttempts
            .FirstOrDefaultAsync(x => x.Email == email && x.Type == type);

        if (state == null)
        {
            return;
        }

        state.FailedAttempts = 0;
        state.LockedUntil = null;
        state.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret is missing.");
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        var expirationMinutes = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var m) ? m : 120;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private void WriteAuthCookies(string accessToken, string refreshToken)
    {
        var secure = Request.IsHttps;

        // OWASP A07 FIXED: Session tokens delivered as HttpOnly cookies to reduce JS access/token theft risk.
        Response.Cookies.Append("securevents_token", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddMinutes(120),
            Path = "/"
        });

        Response.Cookies.Append("securevents_refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/"
        });
    }

    private void ClearAuthCookies()
    {
        Response.Cookies.Delete("securevents_token", new CookieOptions { Path = "/" });
        Response.Cookies.Delete("securevents_refresh_token", new CookieOptions { Path = "/" });
    }
}
