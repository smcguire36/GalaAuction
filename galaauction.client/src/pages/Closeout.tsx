import { Fragment, useContext, useEffect, useState } from "react";
import { useHttp } from "../hooks/useHttp";
import EventContext from "../store/EventContext";
import type { ItemType } from "../types/Item";
import TabNavigation from "../components/TabNavigation";
//import { currencyFormatter } from "../utilities/currencyFormatter";
import type { CategoriesType } from "../types/Categories";

const Closeout = () => {
  const context = useContext(EventContext);
  const { request, isLoading, error } = useHttp();
  const [items, setItems] = useState<ItemType[]>([] as ItemType[]);
  const [categories, setCategories] = useState<CategoriesType[]>(
    [] as CategoriesType[],
  );
  //  const event = context.event;

  useEffect(() => {
    const getCategories = async () => {
      const data = await request(`/api/categories`, "GET");
      setCategories(data);
    };
    const getEvents = async (id: number) => {
      const data = await request(`/api/events/${id}/items/closeout`, "GET");
      setItems(data);
    };
    if (context.eventId && context.eventId !== 0) {
      getCategories();
      getEvents(context.eventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <div>Error Loading Auction Items ...</div>;
  }

  if (items.length === 0) {
    return <></>;
  }

  const handleRowBlur = (e: React.FocusEvent<HTMLTableRowElement>, itemId:number) => {
    const row = e.currentTarget;
    const relatedTarget = e.relatedTarget;

    // e.currentTarget is the <tr>
    // e.relatedTarget is the element gaining focus
    if (!row.contains(relatedTarget as Node)) {
      console.log("Focus has left the row. Triggering change event...");
      console.log(e);
      // Call your save or change logic here
      const inputs = row.querySelectorAll('input');

      const winningBidder = inputs[0]?.value;
      const bidAmount = inputs[1]?.value;

      console.log("Values found:", { itemId, winningBidder, bidAmount });      
    }
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
          </div>
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          {isLoading && (
            <tbody>
              <tr className="text-lg">
                <td colSpan={7} className="text-lg font-bold text-center">
                  Loading guests ... please wait
                </td>
              </tr>
            </tbody>
          )}

          {!isLoading &&
            categories.length > 0 &&
            categories.map((cat) => (
              <Fragment key={cat.categoryId}>
                <thead>
                  <tr className="text-lg bg-accent text-white/50">
                    <th className="text-white">{cat.categoryName}</th>
                    <th>Item #</th>
                    <th>Auction Item</th>
                    <th>Winning Bidder #</th>
                    <th>Winning Bidder</th>
                    <th>Winning Amt ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading &&
                    items.length > 0 &&
                    items
                      .filter((item) => item.categoryId == cat.categoryId)
                      .map((items) => (
                        <tr key={items.itemId} className="text-lg" onBlur={(e) => handleRowBlur(e, items.itemId)}>
                          <td className="py-1"></td>
                          <td className="py-1 font-bold text-2xl">
                            {items.itemNumber}
                          </td>
                          <td className="py-1">{items.itemName}</td>
                          <td className="py-1">
                            <input
                              type="number"
                              name={`winbidnum_${items.itemId}`}
                              defaultValue={items.winningBidderNumber ?? ""}
                              className="input"
                            />
                          </td>
                          <td className="py-1">{items.winningBidderName}</td>
                          <td className="py-1">
                            <input
                              type="number"
                              name={`winbidamt_${items.itemId}`}
                              defaultValue={items.winningBidAmount ?? ""}
                              className="input"
                            />
                          </td>
                        </tr>
                      ))}
                  {/* Dummy Row to keep rows of table from stretching to fill available space */}
                  <tr className="h-full">
                    <td className="bg-base-100"></td>
                  </tr>
                </tbody>
              </Fragment>
            ))}
        </table>
      </div>
    </>
  );
};

export default Closeout;

/*
{items.winningBidAmount > 0
  ? currencyFormatter.format(items.winningBidAmount)
  : ""}
*/
