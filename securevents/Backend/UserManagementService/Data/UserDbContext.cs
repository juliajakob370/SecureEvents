using Microsoft.EntityFrameworkCore;
using UserManagementService.Models;

namespace UserManagementService.Data;

public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<VerificationCode> VerificationCodes => Set<VerificationCode>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<VerificationAttempt> VerificationAttempts => Set<VerificationAttempt>();
    public DbSet<SavedCard> SavedCards => Set<SavedCard>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SavedCard>(entity =>
        {
            entity.HasIndex(c => c.UserId);
            entity.HasIndex(c => new { c.UserId, c.IsDeleted });
            entity.Property(c => c.CardName).HasMaxLength(50);
            entity.Property(c => c.CardLast4).HasMaxLength(4);
            entity.Property(c => c.ExpiryDate).HasMaxLength(5);
            entity.Property(c => c.BillingAddress).HasMaxLength(150);
            entity.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        base.OnModelCreating(modelBuilder);
    }
}
