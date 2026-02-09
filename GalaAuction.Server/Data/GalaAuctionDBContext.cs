using GalaAuction.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace GalaAuction.Server.Data
{
    public class GalaAuctionDBContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<GalaEvent> GalaEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<GalaEvent>()
                .HasData(
                    new GalaEvent
                    {
                        EventName = "Gala 2026",
                        OrganizationName = "Canticorum Virtuosi, Inc.",
                        ThankYouMessage = "Thank you for your support!",
                        IsActive = true
                    }
                );

        }
    }
}
