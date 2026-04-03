namespace GalaAuction.Server.DTOs
{
    public class CheckoutPaymentDto
    {
        public required int GuestId { get; set; }
        public required int GalaEventId { get; set; }
        public required string PaymentMethodId { get; set; }
        public required decimal AmountPaid { get; set; }
        public required int[] ItemsPaid { get; set; }
        public Guid CheckoutLock { get; set; }
    }
}
