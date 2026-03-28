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
    itemsWon: CheckoutItemDto[];
};