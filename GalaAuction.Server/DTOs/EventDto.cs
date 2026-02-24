namespace GalaAuction.Server.DTOs
{
    public class EventDto
    {
        public int GalaEventId { get; set; }
        public required string EventName { get; set; }
        public DateOnly? EventDate { get; set; }
        public required string OrganizationName { get; set; }
        public required string ThankYouMessage { get; set; }
        public int? EventStatusId { get; set; }
        public string? EventStatusText { get; set; }
    }
}
