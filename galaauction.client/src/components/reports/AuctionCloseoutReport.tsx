import { useContext, useState, useEffect } from "react";
import type { GuestDto } from "../../dto/GuestDto";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import type { ItemType } from "../../types/Item";

const AuctionCloseoutReport: React.FC = () => {
  const context = useContext(EventContext);
  const { request, isLoading, error } = useHttp();
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [auctionItems, setAuctionItems] = useState<ItemType[]>([]);

  useEffect(() => {
    if (context.eventId && context.eventId !== 0) {
      getGuests(context.eventId);
      getAuctionItems(context.eventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGuests = async (id: number) => {
    const guestsData = await request(`/api/events/${id}/guests`, "GET");
    setGuests(guestsData);
  };

  const getAuctionItems = async (id: number) => {
    const itemsData = await request(`/api/events/${id}/items`, "GET");
    setAuctionItems(itemsData);
  };


  return (
    <div className="print:m-4 print:mt-12">
      <div className="font-bold text-xl text-center hidden print:block">
                EVENT CLOSEOUT REPORT
      </div>
      <div className="grow overflow-y-auto  my-2">
        <table className="table table-zebra table-pin-rows w-full">
          <thead>
            <tr>
              <th colSpan={3} className="text-lg font-bold">
                UNPAID GUESTS
              </th>
            </tr>
            <tr>
                <th className="text-left" colSpan={2}>
                    Guest Name
                </th>
                <th className="text-center">
                    Bidder Number(s)
                </th>
                <th className="text-center">
                    Items Won
                </th>
                <th className="text-center">
                    Unpaid Auction Number(s)
                </th>
                <th className="text-right">
                    Amount Owed
                </th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => {
              const winningBids = auctionItems.filter(
                (item) => item.winningBidderNumber && (item.winningBidderNumber === guest.inPersonBidderNumber || item.winningBidderNumber === guest.onlineBidderNumber),
              );
              const amountOwed = winningBids.reduce(
                (total, item) => total + (item.isPaid ? 0 : item.winningBidAmount),
                0,
              );
              const unpaidItems = winningBids.reduce(
                (acc, item) => acc + (item.isPaid ? acc : acc !== "" ? ", " + item.itemNumber : item.itemNumber),
                "",
              );
              if (winningBids.length === 0 || amountOwed === 0) {
                return null;        // Skip guests with no winning bids or no amount owed
              }
              return (
                <tr key={guest.guestId}>
                  <td className="text-left" colSpan={2}>{guest.fullNameReversed}</td>
                  <td className="text-center">
                    {guest.inPersonBidderNumber}
                    {guest.onlineBidderNumber && guest.inPersonBidderNumber ? ` / ` : ""}
                    {guest.onlineBidderNumber ? guest.onlineBidderNumber : ""}
                  </td>
                  <td className="text-center">{winningBids.length}</td>
                  <td className="text-center">{unpaidItems}</td>
                  <td className="text-right">${amountOwed.toFixed(2)}</td>
                </tr>
              );
            })}

            {/* Dummy Row to keep rows of table from stretching to fill available space */}
            <tr className="h-full">
              <td className="bg-base-100"></td>
            </tr>
          </tbody>
        </table>
        <table className="table table-zebra table-pin-rows w-full ">
          <thead>
            <tr>
              <th colSpan={3} className="text-lg font-bold">
                PAID GUESTS
              </th>
            </tr>
            <tr>
                <th className="text-left">
                    Guest Name
                </th>
                <th className="text-center">
                    Bidder Number(s)
                </th>
                <th className="text-center">
                    Items Won
                </th>
                <th className="text-center">
                    Payment Method
                </th>
                <th className="text-right">
                    Amount Paid
                </th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => {
              const winningBids = auctionItems.filter(
                (item) => item.winningBidderNumber && (item.winningBidderNumber === guest.inPersonBidderNumber || item.winningBidderNumber === guest.onlineBidderNumber),
              );
              const amountPaid = winningBids.reduce(
                (total, item) => total + (item.isPaid ? item.winningBidAmount : 0),
                0,
              );
              const paymentMethod = winningBids.some(item => item.isPaid) ? winningBids.find(item => item.isPaid)?.paymentMethodName : "";
              if (winningBids.length === 0 || amountPaid === 0) {
                return null;        // Skip guests with no winning bids or no amount paid
              }
              return (
                <tr key={guest.guestId}>
                  <td className="text-left">{guest.fullNameReversed}</td>
                  <td className="text-center">
                    {guest.inPersonBidderNumber}
                    {guest.onlineBidderNumber && guest.inPersonBidderNumber ? ` / ` : ""}
                    {guest.onlineBidderNumber ? guest.onlineBidderNumber : ""}
                  </td>
                  <td className="text-center">{winningBids.length}</td>
                  <td className="text-center">{paymentMethod}</td>
                  <td className="text-right">${amountPaid.toFixed(2)}</td>
                </tr>
              );
            })}

            {/* Dummy Row to keep rows of table from stretching to fill available space */}
            <tr className="h-full">
              <td className="bg-base-100"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuctionCloseoutReport;
