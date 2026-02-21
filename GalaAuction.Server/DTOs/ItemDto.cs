namespace GalaAuction.Server.DTOs
{
    public class ItemDto
    {
        public int ItemId { get; set; }
        public int? ItemNumber { get; set; }
        public required string ItemName { get; set; }
        public int? WinningBidderNumber { get; set; }
        public decimal? WinningBidAmount { get; set; }
        public bool isPaid { get; set; } = false;
        public string? PaymentMethodId { get; set; }
        public required int GalaEventId { get; set; }
        public int CategoryId { get; set; }
    }
}
