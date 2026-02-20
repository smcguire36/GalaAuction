using Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace GalaAuction.Server.Models
{
    public class Item
    {
        [Key]
        public int ItemId { get; set; }
        public required int ItemNumber { get; set; }
        public required string ItemName { get; set; }

        public int? WinningBidderNumber { get; set; }

        // Navigation property back to Bidder
        [ForeignKey("WinningBidderNumber")]
        public Bidder? Bidder { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? WinningBidAmount { get; set; }

        public bool IsPaid { get; set; } = false;

        // Foreign key to PaymentMethods
        [AllowNull]
        public string? PaymentMethodId { get; set; }
        // Navigation property back to PaymentMethod
        [ForeignKey("PaymentMethodId")]
        public PaymentMethod? PaymentMethod { get; set; }

        // Foreign key to GalaEvents
        public required int GalaEventId { get; set; }
        // Navigation property back to parent GalaEvent
        [ForeignKey("GalaEventId")]
        public GalaEvent GalaEvent { get; set; } = null!;

        // Foreign key to Categories
        public int CategoryId { get; set; }
        // Navigation property back to Category
        [ForeignKey("CategoryId")]
        public Category Category { get; set; } = null!;

    }
}

