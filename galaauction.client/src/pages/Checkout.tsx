import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHttp } from "../hooks/useHttp";
import EventContext from "../store/EventContext";
import TabNavigation from "../components/TabNavigation";
import { EventStatus } from "../types/EventStatus";
import type { ModalHandle } from "../components/common/Modal";
import SortableHeader, {
  type SortState,
} from "../components/common/SortableHeader";
import Header from "../components/common/Header";
//import { useConfirm } from "../store/ConfirmProvider";
import CheckoutActionButton from "../components/common/CheckoutActionButton";
import { currencyFormatter } from "../utilities/currencyFormatter";
import CheckoutDialog from "../components/checkout/CheckoutDialog";
import type { CheckoutDto } from "../dto/CheckoutDto";

const Checkout = () => {
  const context = useContext(EventContext);
  const { request, isLoading, error } = useHttp();
  const [guests, setGuests] = useState<CheckoutDto[]>([] as CheckoutDto[]);
  const [selectedGuest, setSelectedGuest] = useState<CheckoutDto>(
    {} as CheckoutDto,
  );
  const checkoutRef = useRef<ModalHandle>(null);
  const event = context.event;
  const [formSession, setFormSession] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [sortState, setSortState] = useState<SortState>({
    name: "",
    direction: undefined,
  });
//  const confirm = useConfirm();

  useEffect(() => {
    if (context.eventId && context.eventId !== 0) {
      getGuests(context.eventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGuests = async (id: number) => {
    const guestsData = await request(`/api/events/${id}/checkout`, "GET");
    setGuests(guestsData);
  };

  const filteredItems = useMemo(() => {
    return guests
      .filter(guest => {
        if (searchText.trim() === "") {
          return true; // If search text is empty, include all guests
        }
        return (
          guest.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          guest.inPersonBidderNumber?.toString().includes(searchText) ||
          guest.onlineBidderNumber?.toString().includes(searchText)
        );
      })
      .sort((a, b) => {
        if (!sortState.direction || sortState.name === "") {
          return 0; // No sorting applied
        }
        const aValue = a[sortState.name as keyof CheckoutDto] ?? "";
        const bValue = b[sortState.name as keyof CheckoutDto] ?? "";
        if (aValue < bValue) {
          return sortState.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortState.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
  }, [guests, searchText, sortState]);

  if (error) {
    return <div>Error Loading Guests for Checkout ...</div>;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleGuestCheckout = (guest: CheckoutDto) => {
    setFormSession(prev => ++prev);
    setSelectedGuest(guest);
    checkoutRef.current?.open();
  };

  const handleModalConfirm = () => {
    getGuests(context.eventId);
  };

  const handleChangeSort = (next: SortState) => {
    setSortState(next);
  };

  return (
    <>
      <div className="flex flex-row">
        <div className="flex-initial align-middle">
          <TabNavigation />
        </div>
        <div className="flex-auto text-right align-middle">
          <div className="flex align-middle flex-row-reverse pt-3 gap-2">
            <label className="input rounded-lg">
              <svg
                className="h-[1em] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </g>
              </svg>
              <input
                type="search"
                placeholder="Search Guests"
                value={searchText}
                onChange={handleSearchChange}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <thead>
            <tr className="text-lg bg-accent text-white/50">
              <SortableHeader
                label="Paid"
                name="isPaid"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "isPaid" ? sortState.direction : undefined
                }
              />
              <Header label="Bidder #" />
              <Header label="Online Bidder #" />
              <Header label="Guest Name" />
              <Header label="Total # of Items Won" />
              <SortableHeader
                label="Total Amount Owed ($)"
                name="totalOwed"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "totalOwed"
                    ? sortState.direction
                    : undefined
                }
              />
              <Header label="Actions" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="text-lg">
                <td colSpan={5} className="text-lg font-bold text-center">
                  Loading guests ... please wait
                </td>
              </tr>
            )}
            {!isLoading && filteredItems.length === 0 && (
              <tr className="text-lg">
                <td colSpan={5} className="text-lg font-bold text-center">
                  No guests found.
                </td>
              </tr>
            )}
            {!isLoading &&
              filteredItems.length > 0 &&
              filteredItems.map(guest => (
                <tr key={guest.guestId} className="text-lg">
                  <td className="py-1">
                    <input
                      type="checkbox"
                      checked={guest.isPaid}
                      className="checkbox checkbox-sm"
                      readOnly
                    />
                  </td>
                  <td className="py-1 text-lg font-bold">{guest.inPersonBidderNumber}</td>
                  <td className="py-1 text-lg font-bold">
                    {guest.onlineBidderNumber ? guest.onlineBidderNumber : "--"}
                  </td>
                  <td className="py-1">{guest.fullName}</td>
                  <td className="py-1">{guest.totalItemsWon}</td>
                  <td className="py-1">
                    {guest.totalOwed && guest.totalOwed > 0
                      ? currencyFormatter.format(guest.totalOwed)
                      : ""}
                  </td>
                  <td className="flex flex-row gap-4 py-1">
                    <CheckoutActionButton
                      onClick={() => handleGuestCheckout(guest)}
                      disabled={event?.eventStatusId === EventStatus.Setup}
                    />
                  </td>
                </tr>
              ))}
            {/* Dummy Row to keep rows of table from stretching to fill available space */}
            <tr className="h-full">
              <td className="bg-base-100"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <CheckoutDialog
        key={`checkout-${formSession}`}
        ref={checkoutRef}
        onConfirm={handleModalConfirm}
        guest={selectedGuest}
      />

    </>
  );
};

export default Checkout;
