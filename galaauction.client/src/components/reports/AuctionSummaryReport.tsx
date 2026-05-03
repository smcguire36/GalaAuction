import { useContext, useEffect, useState } from "react";
import type { GuestDto } from "../../dto/GuestDto";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import type { ItemType } from "../../types/Item";
import { formatDate } from "../../utilities/dateFormatter";

const AuctionSummaryReport: React.FC = () => {
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
                EVENT SUMMARY REPORT
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <tbody>
            <tr>
              <th colSpan={3} className="text-lg font-bold">
                EVENT
              </th>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Event Name</td>
              <td className="text-left">{context.event?.eventName}</td>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Event Date</td>
              <td className="text-left">{formatDate(context.event?.eventDate)}</td>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Event Status</td>
              <td className="text-left">
                {context.event?.eventStatusText}
              </td>
            </tr>
            <tr>
              <th colSpan={3} className="text-lg font-bold">
                GUESTS
              </th>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Total Guests</td>
              <td>{guests.length}</td>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Total In-Person Guests</td>
              <td>
                {guests.filter((guest) => guest.inPersonBidderNumber).length}
              </td>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Total Online Only Bidders</td>
              <td>{guests.filter((guest) => !guest.tableNumber).length}</td>
            </tr>
            <tr>
              <th colSpan={3} className="text-lg font-bold">
                AUCTION ITEMS
              </th>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Total Auction Items</td>
              <td>{auctionItems.length}</td>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Total Items Sold</td>
              <td>
                {auctionItems.filter((item) => item.winningBidderNumber).length}
              </td>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Total Amount Sold</td>
              <td>
                $
                {auctionItems
                  .reduce((total, item) => total + item.winningBidAmount, 0)
                  .toFixed(2)}
              </td>
            </tr>
            <tr>
              <td></td>
              <td className="text-left">Total Items Unpaid</td>
              <td>
                {
                  auctionItems.filter(
                    (item) => item.winningBidderNumber && !item.isPaid,
                  ).length
                }
              </td>
            </tr>

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

export default AuctionSummaryReport;
