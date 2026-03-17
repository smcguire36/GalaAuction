export type ItemFormData = {
  itemId: number;
  itemNumber: number | null;
  itemName: string;
  winningBidderNumber: number | null;
  winningBidderName: string | null;
  winningBidAmount: number | null;
  isPaid: boolean;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
  galaEventId: number;
  categoryId: number | null;
  categoryName: string;
  itemNumberAutoGen: boolean;
};

export const ITEMFORMDEFAULTS: ItemFormData = {
  itemId: 0,
  itemNumber: null,
  itemName: "",
  winningBidderNumber: null,
  winningBidderName: null,
  winningBidAmount: null,
  isPaid: false,
  paymentMethodId: null,
  paymentMethodName: null,
  galaEventId: 0,
  categoryId: null,
  categoryName: "",
  itemNumberAutoGen: false
};
