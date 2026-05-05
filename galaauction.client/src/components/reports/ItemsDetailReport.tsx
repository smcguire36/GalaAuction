import { useContext, useEffect, useState } from "react";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import type { ItemType } from "../../types/Item";
import type { GuestDto } from "../../dto/GuestDto";

const ItemsDetailReport: React.FC = () => {
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
    <div className="print:m-4">
      <div className="grow overflow-y-auto my-2">
        <table className="table table-zebra table-pin-rows w-full print:w-full print:text-sm ">
          <thead>
            <tr className="hidden print:table-row print:mb-4 print:mt-12">
              <th colSpan={6} className="text-lg font-bold text-center">
                AUCTION ITEMS DETAIL REPORT
              </th>
            </tr>
            <tr>
              <th className="text-center">Item Number</th>
              <th className="text-left" colSpan={2}>Item Name</th>
              <th className="text-center">Winning Bidder #</th>
              <th className="text-left">Winning Bidder Name</th>
              <th className="text-right">Winning Bid Amount</th>
            </tr>
          </thead>
          <tbody>
            {auctionItems.map(item => {
              const bidderName = item.winningBidderNumber
                ? guests.find(
                    guest =>
                      guest.inPersonBidderNumber === item.winningBidderNumber ||
                      guest.onlineBidderNumber === item.winningBidderNumber,
                  )?.fullName
                : null;
              return (
                <tr key={item.itemId}>
                  <td className="text-center">{item.itemNumber}</td>
                  <td className="text-left break-words" colSpan={2}>{item.itemName}</td>
                  {item.winningBidderNumber ? (
                    <>
                      <td className="text-center">
                        {item.winningBidderNumber
                          ? item.winningBidderNumber
                          : ""}
                      </td>
                      <td className="text-left break-words">{bidderName}</td>
                      <td className="text-right">
                        {item.winningBidAmount
                          ? `$${item.winningBidAmount.toFixed(2)}`
                          : ""}
                      </td>
                    </>
                  ) : (
                    <td className="text-center" colSpan={3}>
                      ***** NO BIDS *****
                    </td>
                  )}
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

export default ItemsDetailReport;
