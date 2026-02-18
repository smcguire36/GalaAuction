using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GalaAuction.Server.Models
{
    public class Bidder
    {
        [Key]
        public int BidderId { get; set; }
        public required string BidderNumber { get; set; }

        public bool IsOnline { get; set; } = false;

        // Foreign key to Guest
        public int GuestId { get; set; }

        // Navigation property back to Guest
        [ForeignKey("GuestId")]
        [JsonIgnore]
        public Guest Guest { get; set; } = null!;
    }
}
