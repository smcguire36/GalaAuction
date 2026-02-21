namespace GalaAuction.Server.DTOs
{
    public class ItemImportDto
    {
        public int ItemNumber { get; set; }
        public required string ItemName { get; set; }
        public int GalaEventId { get; set; }

    }
}
