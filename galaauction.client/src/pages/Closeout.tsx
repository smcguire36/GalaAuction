import { Fragment, useContext, useEffect, useState } from "react";
import { useHttp } from "../hooks/useHttp";
import EventContext from "../store/EventContext";
import type { ItemType } from "../types/Item";
import TabNavigation from "../components/TabNavigation";
//import { currencyFormatter } from "../utilities/currencyFormatter";
import type { CategoriesType } from "../types/Categories";
import { FloatingInput } from "../components/common/FloatingInput";

const Closeout = () => {
  const context = useContext(EventContext);
  const { request, isLoading, error } = useHttp();
  const [items, setItems] = useState<ItemType[]>([] as ItemType[]);
  const [categories, setCategories] = useState<CategoriesType[]>(
    [] as CategoriesType[],
  );
  const [bidders, setBidders] = useState([] as any[]);
  //  const event = context.event;

  useEffect(() => {
    const getCategories = async () => {
      const data = await request(`/api/categories`, "GET");
      setCategories(data);
    };
    const getBidders = async () => {
      const data = await request(
        `/api/events/${context.eventId}/bidders`,
        "GET",
      );
      setBidders(data);
    };
    const getEvents = async (id: number) => {
      const data = await request(`/api/events/${id}/items/closeout`, "GET");
      setItems(data);
    };
    if (context.eventId && context.eventId !== 0) {
      getCategories();
      getBidders();
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

  const handleRowBlur = (
    e: React.FocusEvent<HTMLTableRowElement>,
    itemId: number,
  ) => {
    const row = e.currentTarget;
    const relatedTarget = e.relatedTarget;

    // e.currentTarget is the <tr>
    // e.relatedTarget is the element gaining focus
    if (!row.contains(relatedTarget as Node)) {
      console.log("Focus has left the row. Triggering change event...");
      console.log(e);
      // Call your save or change logic here
      const inputs = row.querySelectorAll("input");

      const winningBidder = inputs[0]?.value;
      const bidAmount = inputs[1]?.value;
      const parsedWinningBidder =
        winningBidder !== undefined && winningBidder.trim() !== ""
          ? Number(winningBidder)
          : null;
      const parsedBidAmount =
        bidAmount !== undefined && bidAmount.trim() !== ""
          ? Number(bidAmount)
          : null;

      let bidderName =
        bidders.find(b => b.bidderNumber == winningBidder)?.fullName ?? "";
      if (winningBidder !== "" && bidderName === "") {
        // Set the validation to false on the bidder number field
        bidderName = "Unknown Bidder";
      }

      console.log("Values found:", {
        itemId,
        winningBidder,
        bidderName,
        bidAmount,
      });
      // Store the bidder information in the state for now.
      setItems(prevItems =>
        prevItems.map(item => {
          if (item.itemId === itemId) {
            return {
              ...item,
              winningBidderNumber:
                parsedWinningBidder ?? item.winningBidderNumber,
              winningBidderName: bidderName,
              winningBidAmount: parsedBidAmount ?? item.winningBidAmount,
            };
          }
          return item;
        }),
      );
    }
  };

  return (
    <>
      <div className="flex flex-row">
        <div className="flex-initial align-middle">
          <TabNavigation />
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-pin-rows w-full border-collapse">
          {isLoading && (
            <tbody>
              <tr className="text-lg">
                <td colSpan={7} className="text-lg font-bold text-center">
                  Loading auction items ... please wait
                </td>
              </tr>
            </tbody>
          )}

          {!isLoading &&
            categories.length > 0 &&
            categories.map(cat => (
              <Fragment key={cat.categoryId}>
                <thead>
                  <tr className="text-lg text-accent-content bg-base-300">
                    <th className="py-1">{cat.categoryName}</th>
                    <th className="py-1">Item #</th>
                    <th className="py-1">Auction Item</th>
                    <th className="py-1">Winning Bidder #</th>
                    <th className="py-1">Winning Bidder</th>
                    <th className="py-1">Winning Amt ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading &&
                    items.length > 0 &&
                    items
                      .filter(item => item.categoryId == cat.categoryId)
                      .map(item => (
                        <tr
                          key={item.itemId}
                          className="text-lg"
                          onBlur={e => handleRowBlur(e, item.itemId)}
                        >
                          <td className="py-1"></td>
                          <td className="py-1 font-bold text-2xl">
                            {item.itemNumber}
                          </td>
                          <td className="py-1">{item.itemName}</td>
                          <td className="py-1">
                            <FloatingInput
                              label={`Winning Bidder # for ${item.itemNumber}`}
                              type="number"
                              name={`winbidnum_${item.itemId}`}
                              defaultValue={item.winningBidderNumber ?? ""}
                              className="text-lg"
                            />
                          </td>
                          <td
                            className={`py-1 ${item.winningBidderName === "Unknown Bidder" ? "text-red-500" : ""}`}
                          >
                            {item.winningBidderName}
                          </td>
                          <td className="py-1">
                            <FloatingInput
                              label={`Winning Bid Amount for ${item.itemNumber}`}
                              type="number"
                              name={`winbidamt_${item.itemId}`}
                              defaultValue={item.winningBidAmount ?? ""}
                              className="text-lg"
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
