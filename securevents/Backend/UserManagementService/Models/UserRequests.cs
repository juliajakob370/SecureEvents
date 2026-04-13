using System.ComponentModel.DataAnnotations;

namespace UserManagementService.Models;

public record LoginRequest([Required, EmailAddress, MaxLength(100)] string Email);
public record VerifyLoginRequest([Required, EmailAddress, MaxLength(100)] string Email, [Required, RegularExpression("^\\d{6}$")] string Code);
public record SignupRequest([Required, MinLength(2), MaxLength(50)] string FirstName, [Required, MinLength(2), MaxLength(50)] string LastName, [Required, EmailAddress, MaxLength(100)] string Email);
public record VerifySignupRequest([Required, EmailAddress, MaxLength(100)] string Email, [Required, RegularExpression("^\\d{6}$")] string Code);
public record UpdateProfileRequest([Required, MinLength(2), MaxLength(50)] string FirstName, [Required, MinLength(2), MaxLength(50)] string LastName, [Required, EmailAddress, MaxLength(100)] string Email, [RegularExpression("^$|^\\d{6}$")] string? OldEmailCode = null, [RegularExpression("^$|^\\d{6}$")] string? NewEmailCode = null);
public record RequestEmailChangeCodesRequest([Required, EmailAddress, MaxLength(100)] string NewEmail);
public record VerifyPaymentCodeRequest([Required, RegularExpression("^\\d{6}$")] string Code);
public record RefreshTokenRequest(string? RefreshToken);
public record UpdateProfileImageRequest([Range(0, 7)] int ProfileImageIndex);
public record UserResponse(int Id, string FirstName, string LastName, string Email, string Role, int ProfileImageIndex);
public record AdminUserResponse(int Id, string FirstName, string LastName, string Email, string Role, bool IsSuspended, DateTime CreatedAt);

public record SaveCardRequest(
    [Required, MinLength(2), MaxLength(50), RegularExpression("^[A-Za-z\\s'-]{2,50}$")] string CardName,
    [Required, RegularExpression("^\\d{16}$")] string CardNumber,
    [Required, RegularExpression("^(0[1-9]|1[0-2])\\/\\d{2}$")] string ExpiryDate,
    [Required, RegularExpression("^\\d{3,4}$")] string Cvv,
    [Required, MinLength(1), MaxLength(150)] string BillingAddress);

public record SavedCardResponse(int Id, string CardName, string CardLast4, string ExpiryDate, string BillingAddress);
