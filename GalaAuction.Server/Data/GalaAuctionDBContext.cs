using GalaAuction.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace GalaAuction.Server.Data
{
    public class GalaAuctionDBContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<GalaEvent> GalaEvents { get; set; }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<Bidder> Bidders { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Item> Items { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // This data wil always seed tables in any environment,
            // ensuring that essential reference data is available in both development and production.
            modelBuilder.SeedProductionData();

            // This bloc will only run when the application is in development mode,
            // allowing us to seed test data without affecting the production database.
#if DEBUG
            modelBuilder.SeedDevelopmentData();
#endif

        }
        public DbSet<GalaAuction.Server.Models.Item> Item { get; set; } = default!;
    }

    public static class ModelBuilderExtensions
    {
        public static void SeedDevelopmentData(this ModelBuilder modelBuilder)
        {
            // Seed data for GalaEvent (development only)
            modelBuilder.Entity<GalaEvent>()
                .HasData(
                    new GalaEvent
                    {
                        GalaEventId = 1,
                        EventName = "Gala 2026",
                        OrganizationName = "Canticorum Virtuosi, Inc.",
                        ThankYouMessage = "Thank you for your support!",
                        EventStatus = "Setup",
                        CreatedAt = new DateTime(2026,2,15,23,0,0,DateTimeKind.Utc)
                    }
                );

            // Seed data for Items (development only)
            modelBuilder.Entity<Item>()
                .HasData(
                    new Item
                    {
                        ItemId = -1,
                        ItemNumber = 201,
                        ItemName = "Adirondack Get-away",
                        GalaEventId = 1,
                        CategoryId = 2
                    },
                    new Item
                    {
                        ItemId = -2,
                        ItemNumber = 202,
                        ItemName = "The Bunker Hill Inn",
                        GalaEventId = 1,
                        CategoryId = 2
                    },
                    new Item
                    {
                        ItemId = -3,
                        ItemNumber = 301,
                        ItemName = "Veuve Cliquot Champagne Brut, with flutes",
                        GalaEventId = 1,
                        CategoryId = 3
                    },
                    new Item
                    {
                        ItemId = -4,
                        ItemNumber = 303,
                        ItemName = "Crate of Summer Wines",
                        GalaEventId = 1,
                        CategoryId = 3
                    },
                    new Item
                    {
                        ItemId = -5,
                        ItemNumber = 601,
                        ItemName = "Golf Outing",
                        GalaEventId = 1,
                        CategoryId = 6
                    },
                    new Item
                    {
                        ItemId = -6,
                        ItemNumber = 602,
                        ItemName = "Yankee Tickets (4)",
                        GalaEventId = 1,
                        CategoryId = 6
                    },
                    new Item
                    {
                        ItemId = -7,
                        ItemNumber = 901,
                        ItemName = "Orchid",
                        GalaEventId = 1,
                        CategoryId = 9
                    },
                    new Item
                    {
                        ItemId = -8,
                        ItemNumber = 902,
                        ItemName = "Orchid",
                        GalaEventId = 1,
                        CategoryId = 9
                    }
                );
            // Seed data for Guests (development only)
            modelBuilder.Entity<Guest>()
                .HasData(
                    new Guest
                    {
                        GuestId = -1,
                        FirstName = "Stewart",
                        LastName = "McGuire",
                        TableNumber = 2,
                        GalaEventId = 1
                    },
                    new Guest
                    {
                        GuestId = -2,
                        FirstName = "Elisabeth",
                        LastName = "McDonald",
                        TableNumber = 2,
                        GalaEventId = 1
                    },
                    new Guest
                    {
                        GuestId = -3,
                        FirstName = "Edie",
                        LastName = "Rosenbaum",
                        TableNumber = 1,
                        GalaEventId = 1
                    },
                    new Guest
                    {
                        GuestId = -4,
                        FirstName = "Harold",
                        LastName = "Rosenbaum",
                        TableNumber = 1,
                        GalaEventId = 1
                    },
                    new Guest
                    {
                        GuestId = -5,
                        FirstName = "Peggy",
                        LastName = "McGuire",
                        TableNumber = 2,
                        GalaEventId = 1
                    }
                );
            // Seed data for Bidders (development only)
            modelBuilder.Entity<Bidder>()
                .HasData(
                    new Bidder
                    {
                        BidderId = -1,
                        GuestId = -1,
                        BidderNumber = "1",
                        IsOnline = false
                    },
                    new Bidder
                    {
                        BidderId = -2,
                        GuestId = -2,
                        BidderNumber = "2",
                        IsOnline = false
                    },
                    new Bidder
                    {
                        BidderId = -3,
                        GuestId = -2,
                        BidderNumber = "ESM",
                        IsOnline = true
                    },
                    new Bidder
                    {
                        BidderId = -4,
                        GuestId = -3,
                        BidderNumber = "3",
                        IsOnline = false
                    },
                    new Bidder
                    {
                        BidderId = -5,
                        GuestId = -3,
                        BidderNumber = "ER",
                        IsOnline = true
                    },
                    new Bidder
                    {
                        BidderId = -6,
                        GuestId = -4,
                        BidderNumber = "4",
                        IsOnline = false
                    },
                    new Bidder
                    {
                        BidderId = -7,
                        GuestId = -5,
                        BidderNumber = "5",
                        IsOnline = false
                    },
                    new Bidder
                    {
                        BidderId = -8,
                        GuestId = -5,
                        BidderNumber = "PM",
                        IsOnline = true
                    }
                );
        }

        public static void SeedProductionData(this ModelBuilder modelBuilder)
        {
            // Static Data for Categories
            modelBuilder.Entity<Category>()
                .HasData(
                    new Category
                    {
                        CategoryId = 2,
                        CategoryName = "Getaways"
                    },
                    new Category
                    {
                        CategoryId = 3,
                        CategoryName = "Alcohol"
                    },
                    new Category
                    {
                        CategoryId = 4,
                        CategoryName = "Restaurants"
                    },
                    new Category
                    {
                        CategoryId = 5,
                        CategoryName = "Events"
                    },
                    new Category
                    {
                        CategoryId = 6,
                        CategoryName = "Sports"
                    },
                    new Category
                    {
                        CategoryId = 7,
                        CategoryName = "Artwork"
                    },
                    new Category
                    {
                        CategoryId = 8,
                        CategoryName = "Services"
                    },
                    new Category
                    {
                        CategoryId = 9,
                        CategoryName = "Orchids"
                    }
                );

            // Static Data for Payment Methods
            modelBuilder.Entity<PaymentMethod>()
                .HasData(
                    new PaymentMethod
                    {
                        PaymentMethodId = "AmEx",
                        PaymentMethodName = "American Express"
                    },
                    new PaymentMethod
                    {
                        PaymentMethodId = "Cash",
                        PaymentMethodName = "Cash"
                    },
                    new PaymentMethod
                    {
                        PaymentMethodId = "Chk",
                        PaymentMethodName = "Check"
                    },
                    new PaymentMethod
                    {
                        PaymentMethodId = "Disc",
                        PaymentMethodName = "Discover"
                    },
                    new PaymentMethod
                    {
                        PaymentMethodId = "MC",
                        PaymentMethodName = "Mastercard"
                    },
                    new PaymentMethod
                    {
                        PaymentMethodId = "Visa",
                        PaymentMethodName = "Visa"
                    },
                    new PaymentMethod
                    {
                        PaymentMethodId = "Other",
                        PaymentMethodName = "Other"
                    }
                );

        }
    }
}
