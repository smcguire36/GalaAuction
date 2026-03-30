export type CheckoutListDto = {
    guestId: number;
    fullName: string;
    galaEventId: number;
    inPersonBidderNumber: number;
    onlineBidderNumber: number;
    totalItemsWon: number | null;
    totalOwed: number | null;
    isPaid: boolean;
};