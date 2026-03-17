export type CheckoutItemsDto = {
    itemId: number;
    itemNumber: string;
    itemName: string;
    winningBidderNumber: number;
    winningBidAmount: number;
};

export type CheckoutDto = {
    guestId: number;
    fullName: string;
    galaEventId: number;
    inPersonBidderNumber: number;
    onlineBidderNumber: number;
    totalItemsWon: number | null;
    totalOwed: number | null;
    isPaid: boolean;
    itemsWon: CheckoutItemsDto[];
};