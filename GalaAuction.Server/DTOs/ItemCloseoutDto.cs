namespace GalaAuction.Server.DTOs
{
    public class ItemCloseoutDto
    {
        public int ItemId { get; set; }
        public int? WinningBidderNumber { get; set; }
        public decimal? WinningBidAmount { get; set; }
    }
}
