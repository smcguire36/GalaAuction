using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace GalaAuction.Server.Models
{
    public class Guest
    {
        public int GuestId { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public int? TableNumber { get; set; }

        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";

        [NotMapped]
        public string FullNameReversed => $"{LastName}, {FirstName}";

        // Navigation property for related Bidders
        public List<Bidder> Bidders { get; set; } = new List<Bidder>();

        // Foreign key to GalaEvent
        public required int GalaEventId { get; set; }
        // Navigation property back to parent GalaEvent
        [ForeignKey("GalaEventId")]
        public GalaEvent? GalaEvent { get; set; }
        public bool OnlineBidderOnly { get; set; } = false;

    }
}
