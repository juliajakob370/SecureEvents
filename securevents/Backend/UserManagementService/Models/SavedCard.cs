using System.ComponentModel.DataAnnotations;

namespace UserManagementService.Models;

public class SavedCard
{
    public int Id { get; set; }
    public int UserId { get; set; }

    [Required]
    [StringLength(50)]
    public string CardName { get; set; } = string.Empty;

    [Required]
    [StringLength(4)]
    public string CardLast4 { get; set; } = string.Empty;

    [Required]
    [StringLength(5)]
    public string ExpiryDate { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string BillingAddress { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public User User { get; set; } = null!;
}
