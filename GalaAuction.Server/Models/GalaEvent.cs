using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace GalaAuction.Server.Models
{
    public class GalaEvent
    {
        public int GalaEventId { get; set; }
        public required string EventName { get; set; }
        public DateOnly? EventDate { get; set; }
        public required string OrganizationName { get; set; }
        public required string ThankYouMessage { get; set; }
        public int EventStatus { get; set; } = 0;   // 0="Setup", 1="Active", 2="Closeout", 3="Checkout", 4="Closed"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property for related Bidders
        public List<Guest> Guests { get; set; } = new List<Guest>();

        // Navigation property for related Items 
        public List<Item> Items { get; set; } = new List<Item>();
    }
}
