namespace GalaAuction.Server.DTOs
{
    public class CheckoutItemDto
    {
        public int ItemId { get; set; }
        public required int ItemNumber { get; set; }
        public required string ItemName { get; set; }
        public int? WinningBidderNumber { get; set; }
        public decimal? WinningBidAmount { get; set; }
    }
}
