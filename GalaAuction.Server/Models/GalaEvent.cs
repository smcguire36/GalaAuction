using System.ComponentModel.DataAnnotations;

namespace GalaAuction.Server.Models
{
    public class GalaEvent
    {
        public int GalaEventId { get; set; }
        public required string EventName { get; set; }
        public required string OrganizationName { get; set; }
        public required string ThankYouMessage { get; set; }
        public bool IsActive { get; set; } = false;
        public bool IsClosed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
