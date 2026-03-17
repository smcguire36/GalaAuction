namespace GalaAuction.Server.DTOs
{
    public class BidderDto
    {
        public int BidderId { get; set; }
        public int? BidderNumber { get; set; }
        public bool IsOnline { get; set; }
        public string FullName { get; set; } = "";
        public string FullNameReversed { get; set; } = "";
    }
}
