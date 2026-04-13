using System.ComponentModel.DataAnnotations;

namespace EventManagementService.Models;

public class EventItem
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Date { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Time { get; set; } = string.Empty;
    [Required, MaxLength(100)]
    public string Location { get; set; } = string.Empty;
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    [Required, MaxLength(100)]
    public string Organizer { get; set; } = string.Empty;
    [MaxLength(500)]
    public string Image { get; set; } = string.Empty;
    [Required, MaxLength(20)]
    public string Status { get; set; } = "active";
    [Range(1, 100000)]
    public int Capacity { get; set; }
    [Required, MaxLength(30)]
    public string Price { get; set; } = "Free";
    public int? CreatedByUserId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
