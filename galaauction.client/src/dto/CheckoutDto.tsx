import type { CheckoutItemDto } from "./CheckoutItemDto";

export type CheckoutDto = {
    guestId: number;
    fullName: string;
    galaEventId: number;
    inPersonBidderNumber: number;
    onlineBidderNumber: number;
    totalItemsWon: number | null;
    totalOwed: number | null;
    isPaid: boolean;
    paymentMethodId: string | null;
    paymentDate: Date | null;
    itemsWon: CheckoutItemDto[];
    checkoutLock: string | null;     // Id of the checkout lock that was acquired for this transaction, ensures that the lock is released after payment is processed
};