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
public class PaymentsController : ControllerBase
{
    private readonly EventDbContext _context;
    private readonly LoggingClient _loggingClient;

    public PaymentsController(EventDbContext context, LoggingClient loggingClient)
    {
        _context = context;
        _loggingClient = loggingClient;
    }

    [HttpPost("checkout")]
    // OWASP A01 FIXED: Authentication required. Anonymous users cannot create payment transactions.
    [Authorize(Policy = "OwnerOrAdmin")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        if (!ModelState.IsValid)
        {
            // OWASP A03/A05 FIXED: centralized DTO validation blocks malformed payment input.
            return ValidationProblem(ModelState);
        }

        // A05 FIXED: Server-side input validation for payment payload.
        if (string.IsNullOrWhiteSpace(request.EventTitle) ||
            string.IsNullOrWhiteSpace(request.BuyerEmail) ||
            string.IsNullOrWhiteSpace(request.CardLast4) ||
            request.Quantity <= 0 ||
            request.TotalAmount < 0)
        {
            return BadRequest(new { message = "Invalid payment data." });
        }

        var cleanLast4 = request.CardLast4.Trim();
        if (cleanLast4.Length != 4 || !cleanLast4.All(char.IsDigit))
        {
            return BadRequest(new { message = "Card last 4 digits are invalid." });
        }

        // OWASP A01 FIXED: Buyer email must match the authenticated user's JWT email claim.
        // Prevents an attacker from issuing payments attributed to another account.
        var currentEmail = User.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(currentEmail) ||
            !string.Equals(request.BuyerEmail.Trim(), currentEmail, StringComparison.OrdinalIgnoreCase))
        {
            return Forbid();
        }

        var eventItem = await _context.Events.FirstOrDefaultAsync(x => x.Id == request.EventId && !x.IsDeleted);
        if (eventItem == null)
        {
            return NotFound(new { message = "Event not found." });
        }

        if (!string.Equals(eventItem.Status, "active", StringComparison.OrdinalIgnoreCase))
        {
            // OWASP A01/A05 FIXED: block payment for cancelled/pending/past events.
            return BadRequest(new { message = "This event is not available for payment." });
        }

        var soldCount = await _context.BookingRecords
            .Where(x => !x.IsDeleted && x.EventId == request.EventId && x.Status == "Confirmed")
            .SumAsync(x => (int?)x.Quantity) ?? 0;

        if (soldCount + request.Quantity > eventItem.Capacity)
        {
            return BadRequest(new { message = "Ticket quantity exceeds remaining capacity." });
        }

        var transaction = new PaymentTransaction
        {
            EventTitle = request.EventTitle.Trim(),
            Quantity = request.Quantity,
            TotalAmount = request.TotalAmount,
            BuyerEmail = request.BuyerEmail.Trim().ToLowerInvariant(),
            CardLast4 = cleanLast4,
            Status = "Paid",
            CreatedAt = DateTime.UtcNow
        };

        // A03 FIXED: EF Core tracked insert, no raw SQL.
        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        await _loggingClient.LogAsync("payment-success", $"Payment {transaction.Id} for {transaction.BuyerEmail}");

        return Ok(new
        {
            message = "Payment completed",
            transactionId = transaction.Id,
            status = transaction.Status
        });
    }
}
