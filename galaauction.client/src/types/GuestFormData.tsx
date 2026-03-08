export type GuestFormData = {
  guestId: number;
  firstName: string;
  lastName: string;
  tableNumber: number | null;
  inPersonBidderNumber: number | null;
  onlineBidderNumber: number | null;
  onlineBidderOnly: boolean;
  inPersonAutoGen: boolean;
  onlineAutoGen: boolean;
};

export const GUESTFORMDEFAULTS: GuestFormData = {
  guestId: 0,
  firstName: "",
  lastName: "",
  tableNumber: null,
  inPersonBidderNumber: null,
  onlineBidderNumber: null,
  inPersonAutoGen: true,
  onlineAutoGen: false,
  onlineBidderOnly: false
};
