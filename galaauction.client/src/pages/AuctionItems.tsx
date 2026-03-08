import { useContext, useEffect, useState } from "react";
import { useHttp } from "../hooks/useHttp";
import EventContext from "../store/EventContext";
import type { ItemType } from "../types/Item";
import TabNavigation from "../components/TabNavigation";
import { currencyFormatter } from "../utilities/currencyFormatter";
import { EventStatus } from "../types/EventStatus";

const AuctionItems = () => {
  const context = useContext(EventContext);
  const { request, isLoading, error } = useHttp();
  const [items, setItems] = useState<ItemType[]>([] as ItemType[]);
  const event = context.event;

  useEffect(() => {
    const getEvents = async (id: number) => {
      const data = await request(`/api/events/${id}/items`, "GET");
      setItems(data);
    };
    if (context.eventId && context.eventId !== 0) {
      getEvents(context.eventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <div>Error Loading Guests ...</div>;
  }

  if (items.length === 0) {
    return <></>;
  }

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
              <input type="search" placeholder="Search Auction Items" />
            </label>
            <button className="btn btn-outline">
              ADD ITEM
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button className="btn btn-outline">
              UPLOAD CSV
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <thead>
            <tr className="text-lg bg-accent text-white/50">
              <th className="border-b-2 border-primary-800 py-1">Paid</th>
              <th className="py-1">Item #</th>
              <th className="py-1">Category</th>
              <th className="py-1">Auction Item</th>
              <th className="py-1">Winning Bidder #</th>
              <th className="py-1">Winning Bidder</th>
              <th className="py-1">Winning Amount</th>
              <th className="py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="text-lg">
                <td colSpan={7} className="text-lg font-bold text-center">
                  Loading guests ... please wait
                </td>
              </tr>
            )}
            {!isLoading &&
              items.length > 0 &&
              items.map((items) => (
                <tr key={items.itemId} className="text-lg">
                  <td className="py-1">
                    <input
                      type="checkbox"
                      checked={true}
                      className="checkbox checkbox-sm"
                      readOnly
                    />
                  </td>
                  <td className="py-1 font-bold">{items.itemNumber}</td>
                  <td className="py-1">{items.categoryName}</td>
                  <td className="py-1">{items.itemName}</td>
                  <td className="py-1">{items.winningBidderNumber}</td>
                  <td className="py-1">{items.winningBidderName}</td>
                  <td className="py-1">{items.winningBidAmount > 0 ? currencyFormatter.format(items.winningBidAmount) : ""}</td>
                  <td className="flex flex-row gap-4 py-1">
                    <button className={`btn btn-outline px-2 ${event?.eventStatusId !== EventStatus.Setup?"btn-disabled":""}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                    </button>
                    <button className={`btn btn-outline px-2 ${event?.eventStatusId !== EventStatus.Setup?"btn-disabled":"text-red-800"}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                        </svg>
                    </button>
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
    </>
  );
};

export default AuctionItems;
