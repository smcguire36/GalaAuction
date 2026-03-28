export type CheckoutPaymentDto = {
    guestId: number;
    galaEventId: number;
    paymentMethodId: string;
    amountPaid: number;
    itemsPaid: number[];        // List of itemIds that are being paid for in this transaction
    checkoutLock: string;     // Id of the checkout lock that was acquired for this transaction, ensures that the lock is released after payment is processed
};