using Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.Mapping;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace GalaAuction.Server.Models
{
    public class Item
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ItemId { get; set; }
        public required string ItemName { get; set; }

        [AllowNull]
        public int? WinningBidderNumber { get; set; }

        [AllowNull]
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


    }
}

