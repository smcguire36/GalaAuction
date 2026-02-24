namespace GalaAuction.Server.DTOs
{
    public class CheckoutDto
    {
        public required int GuestId { get; set; }
        public required string FullName { get; set; }
        public int? InPersonBidderNumber { get; set; }
        public int? OnlineBidderNumber { get; set; }
        public CheckoutItemDto[] ItemsWon { get; set; } = [];
    }
}
