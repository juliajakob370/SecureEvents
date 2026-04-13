using EventManagementService.Data;
using EventManagementService.Models;
using EventManagementService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EventManagementService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly EventDbContext _context;
    private readonly LoggingClient _loggingClient;
    private readonly ILogger<EventsController> _logger;
    private readonly IWebHostEnvironment _environment;

    public EventsController(EventDbContext context, LoggingClient loggingClient, ILogger<EventsController> logger, IWebHostEnvironment environment)
    {
        _context = context;
        _loggingClient = loggingClient;
        _logger = logger;
        _environment = environment;
    }

    [HttpPost("upload-image")]
    [Authorize(Policy = "OwnerOrAdmin")]
    [RequestSizeLimit(2 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Image file is required." });
        }

        var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowed.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Only JPG, PNG, and WEBP images are allowed." });
        }

        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var uploadsRoot = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "events", userId.ToString());
        Directory.CreateDirectory(uploadsRoot);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var relativeUrl = $"/uploads/events/{userId}/{fileName}";
        await _loggingClient.LogAsync("event-image-uploaded", $"User {userId} uploaded event image {fileName}");

        return Ok(new { imageUrl = relativeUrl });
    }

    [HttpGet]
    public async Task<IActionResult> GetEvents()
    {
        // A03 FIXED: No raw SQL used.
        // OWASP A01 FIXED: Public feed excludes non-approved records.
        var events = await _context.Events
            .Where(x => !x.IsDeleted && (x.Status == "active" || x.Status == "past"))
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
        return Ok(events);
    }

    [HttpGet("{id:int}/availability")]
    public async Task<IActionResult> GetAvailability(int id)
    {
        var eventItem = await _context.Events.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (eventItem == null)
        {
            return NotFound(new { message = "Event not found." });
        }

        var soldConfirmed = await _context.BookingRecords
            .Where(x => !x.IsDeleted && x.EventId == id && x.Status == "Confirmed")
            .SumAsync(x => (int?)x.Quantity) ?? 0;

        var remaining = Math.Max(0, eventItem.Capacity - soldConfirmed);
        var purchasable = string.Equals(eventItem.Status, "active", StringComparison.OrdinalIgnoreCase) && remaining > 0;

        return Ok(new
        {
            eventId = eventItem.Id,
            capacity = eventItem.Capacity,
            soldConfirmed,
            remaining,
            status = eventItem.Status,
            purchasable
        });
    }

    [HttpPost]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> CreateEvent([FromBody] EventItem eventItem)
    {
        if (!ModelState.IsValid)
        {
            // OWASP A03/A05 FIXED: centralized DTO/entity validation blocks malformed event input.
            return ValidationProblem(ModelState);
        }

        // A05 FIXED: Input validation for required fields.
        if (string.IsNullOrWhiteSpace(eventItem.Title) || string.IsNullOrWhiteSpace(eventItem.Date))
        {
            return BadRequest(new { message = "Title and date are required." });
        }

        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        eventItem.Id = 0;
        eventItem.CreatedByUserId = userId;
        eventItem.CreatedAt = DateTime.UtcNow;
        eventItem.Status = "pending";
        eventItem.IsDeleted = false;
        eventItem.DeletedAt = null;

        _context.Events.Add(eventItem);
        await _context.SaveChangesAsync();

        await _loggingClient.LogAsync("event-created", $"Event '{eventItem.Title}' created");
        return Ok(eventItem);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> UpdateEvent(int id, [FromBody] EventItem request)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null || eventItem.IsDeleted)
        {
            return NotFound();
        }

        if (eventItem.CreatedByUserId != userId && !IsAdmin())
        {
            // A01 FIXED: Owner-only edit access control.
            return Forbid();
        }

        // OWASP A01 FIXED: Any non-admin edit routes the event back through moderation
        // so unreviewed content cannot reach the public feed. Cancelled events stay
        // cancelled; admins can set status freely.
        string nextStatus;
        if (IsAdmin())
        {
            nextStatus = request.Status;
        }
        else if (eventItem.Status == "cancelled")
        {
            nextStatus = "cancelled";
        }
        else
        {
            nextStatus = "pending";
        }

        eventItem.Title = request.Title;
        eventItem.Date = request.Date;
        eventItem.Time = request.Time;
        eventItem.Location = request.Location;
        eventItem.Description = request.Description;
        eventItem.Organizer = request.Organizer;
        eventItem.Image = request.Image;
        eventItem.Status = nextStatus;
        eventItem.Capacity = request.Capacity;
        eventItem.Price = request.Price;

        await _context.SaveChangesAsync();
        await _loggingClient.LogAsync("event-updated", $"Event '{eventItem.Title}' updated (status={nextStatus})");

        return Ok(eventItem);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null || eventItem.IsDeleted)
        {
            return NotFound();
        }

        if (eventItem.CreatedByUserId != userId && !IsAdmin())
        {
            // A01 FIXED: Owner-only delete/refund access control.
            return Forbid();
        }

        // OWASP A09 support: keep immutable event trail by cancellation state (no hard delete).
        eventItem.Status = "cancelled";
        eventItem.IsDeleted = false;
        eventItem.DeletedAt = null;
        await _context.SaveChangesAsync();

        await _loggingClient.LogAsync("event-cancelled", $"Event '{eventItem.Title}' cancelled");
        return Ok(new { message = "Event cancelled", eventItem });
    }

    [HttpPost("{id:int}/request-cancel-code")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> RequestCancelCode(int id)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var ownerEmail = User.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ownerEmail))
        {
            return BadRequest(new { message = "Owner email claim is missing." });
        }

        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null || eventItem.IsDeleted)
        {
            return NotFound();
        }

        if (eventItem.CreatedByUserId != userId && !IsAdmin())
        {
            return Forbid();
        }

        var code = Random.Shared.Next(100000, 999999).ToString();
        _context.EventCancellationCodes.Add(new EventCancellationCode
        {
            EventId = id,
            OwnerEmail = ownerEmail,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false
        });

        await _context.SaveChangesAsync();

        var prevColor = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine();
        Console.WriteLine("╔══════════════════════════════════════════════════════╗");
        Console.WriteLine("║           🔴  EVENT CANCELLATION CODE  🔴           ║");
        Console.WriteLine("╠══════════════════════════════════════════════════════╣");
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"║  Event:  #{id,-43} ║");
        Console.WriteLine($"║  Email:  {ownerEmail,-43} ║");
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"║  Code:   {code,-43} ║");
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("╚══════════════════════════════════════════════════════╝");
        Console.WriteLine();
        Console.ForegroundColor = prevColor;

        await _loggingClient.LogAsync("event-cancel-code-requested", $"Cancel code requested for event {id} by {ownerEmail}");

        return Ok(new { message = "Cancellation code generated. Check backend console." });
    }

    [HttpPost("{id:int}/refund-cancel")]
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> RefundAndCancel(int id, [FromBody] VerifyEventCancelCodeRequest request)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var ownerEmail = User.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ownerEmail))
        {
            return BadRequest(new { message = "Owner email claim is missing." });
        }

        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null || eventItem.IsDeleted)
        {
            return NotFound();
        }

        if (eventItem.CreatedByUserId != userId && !IsAdmin())
        {
            return Forbid();
        }

        var verification = await _context.EventCancellationCodes
            .Where(x => x.EventId == id && x.OwnerEmail == ownerEmail && !x.IsUsed)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (verification == null || verification.ExpiresAt < DateTime.UtcNow || verification.Code != request.Code)
        {
            return BadRequest(new { message = "Invalid cancellation code." });
        }

        verification.IsUsed = true;

        var affectedBookings = await _context.BookingRecords
            .Where(x => x.EventId == eventItem.Id && x.Status == "Confirmed")
            .ToListAsync();

        var refundedAmount = affectedBookings.Sum(x => x.TotalAmount);
        foreach (var booking in affectedBookings)
        {
            booking.Status = "Refunded";
        }

        // OWASP A09 support: retain event row for auditability and mark cancelled/refunded.
        eventItem.Status = "cancelled";
        eventItem.IsDeleted = false;
        eventItem.DeletedAt = null;
        await _context.SaveChangesAsync();

        await _loggingClient.LogAsync("event-cancelled-refunded", $"Event {id} cancelled by {ownerEmail}; refunded={refundedAmount}");
        return Ok(new { message = "Event cancelled and refunds completed", refundedBookings = affectedBookings.Count, refundedAmount, eventItem });
    }

    [Authorize(Policy = "OwnerOrAdmin")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyEvents()
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "Not logged in" });
        }

        var events = await _context.Events
            .Where(x => !x.IsDeleted && x.CreatedByUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(events);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/pending")]
    public async Task<IActionResult> AdminPendingEvents()
    {
        var events = await _context.Events
            .Where(x => !x.IsDeleted && x.Status == "pending")
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(events);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> AdminAllEvents()
    {
        var events = await _context.Events
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(events);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id:int}/admin/approve")]
    public async Task<IActionResult> AdminApproveEvent(int id)
    {
        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null || eventItem.IsDeleted)
        {
            return NotFound();
        }

        eventItem.Status = ParseEventStatus(eventItem.Date, eventItem.Time);
        await _context.SaveChangesAsync();
        await _loggingClient.LogAsync("admin-event-approved", $"Admin approved event {id}");

        return Ok(new { message = "Event approved", eventItem });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id:int}/admin/reject")]
    public async Task<IActionResult> AdminRejectEvent(int id)
    {
        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null || eventItem.IsDeleted)
        {
            return NotFound();
        }

        eventItem.Status = "cancelled";
        await _context.SaveChangesAsync();
        await _loggingClient.LogAsync("admin-event-rejected", $"Admin rejected event {id}");

        return Ok(new { message = "Event rejected", eventItem });
    }

    private bool TryGetCurrentUserId(out int userId)
    {
        userId = 0;
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out userId);
    }

    private bool IsAdmin() => string.Equals(User.FindFirstValue(ClaimTypes.Role), "Admin", StringComparison.OrdinalIgnoreCase);

    private static string ParseEventStatus(string date, string time)
    {
        if (DateTime.TryParse($"{date} {time}", out var dt))
        {
            return dt < DateTime.Now ? "past" : "active";
        }

        return "active";
    }
}
