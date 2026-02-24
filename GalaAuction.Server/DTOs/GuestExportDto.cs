namespace GalaAuction.Server.DTOs
{
    public class GuestExportDto
    {
        public required string FullName { get; set; }
        public required string LastName { get; set; }
        public required string FirstName { get; set; }
        public int? TableNumber { get; set; }
        public int BidderNumber { get; set; }
    }
}
