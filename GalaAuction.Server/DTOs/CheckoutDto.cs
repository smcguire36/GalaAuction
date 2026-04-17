namespace GalaAuction.Server.DTOs
{
    public class CheckoutDto
    {
        public required int GuestId { get; set; }
        public required string FullName { get; set; }
        public int? InPersonBidderNumber { get; set; }
        public int? OnlineBidderNumber { get; set; }
        public int GalaEventId { get; set; }
        public int TotalItemsWon { get; set; }
        public decimal TotalOwed { get; set; }
        public bool IsPaid { get; set; }
        public string? PaymentMethodId { get; set; }
        public string? PaymentMethodName { get; set; }
        public DateTime? PaymentDate { get; set; }
        public CheckoutItemDto[] ItemsWon { get; set; } = [];
        public Guid? CheckoutLock { get; set; }
    }
}
