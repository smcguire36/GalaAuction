namespace GalaAuction.Server.DTOs
{
    public class GuestDto
    {
        public int GuestId { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public int? TableNumber { get; set; }
        public int GalaEventId { get; set; }
        public string? InPersonBidderNumber { get; set; }
        public string? OnlineBidderNumber { get; set; }
        public bool OnlineBidderOnly { get; set; }
    }
}
