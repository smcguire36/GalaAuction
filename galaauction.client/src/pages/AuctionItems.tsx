import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHttp } from "../hooks/useHttp";
import EventContext from "../store/EventContext";
import type { ItemType } from "../types/Item";
import TabNavigation from "../components/TabNavigation";
import { currencyFormatter } from "../utilities/currencyFormatter";
import { EventStatus } from "../types/EventStatus";
import type { SortState } from "../components/common/SortableHeader";
import SortableHeader from "../components/common/SortableHeader";
import Header from "../components/common/Header";
import UploadCsvButton from "../components/common/UploadCsvButton";
import AddActionButton from "../components/common/AddActionButton";
import EditActionButton from "../components/common/EditActionButton";
import DeleteActionButton from "../components/common/DeleteActionButton";
import UploadItemsDialog from "../components/items/UploadItemsDialog";
import type { ModalHandle } from "../components/common/Modal";
import AddItemDialog from "../components/items/AddItemDialog";
import { useConfirm } from "../store/ConfirmProvider";
import EditItemDialog from "../components/items/EditItemDialog";

const AuctionItems = () => {
  const context = useContext(EventContext);
  const { request, isLoading, error } = useHttp();
  const [items, setItems] = useState<ItemType[]>([] as ItemType[]);
  const [selectedItem, setSelectedItem] = useState<ItemType>({} as ItemType);
  const event = context.event;
  const addItemRef = useRef<ModalHandle>(null);
  const editItemRef = useRef<ModalHandle>(null);
  const uploadItemsRef = useRef<ModalHandle>(null);
  const [formSession, setFormSession] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [sortState, setSortState] = useState<SortState>({
    name: "",
    direction: undefined,
  });
  const confirm = useConfirm();

  useEffect(() => {
    if (context.eventId && context.eventId !== 0) {
      getItems(context.eventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getItems = async (id: number) => {
    const itemsData = await request(`/api/events/${id}/items`, "GET");
    setItems(itemsData);
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (searchText.trim() === "") {
          return true; // If search text is empty, include all items
        }
        return (
          item.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.categoryName.toLowerCase().includes(searchText.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (!sortState.direction || sortState.name === "") {
          return 0; // No sorting applied
        }
        const aValue = a[sortState.name as keyof ItemType];
        const bValue = b[sortState.name as keyof ItemType];
        if (aValue < bValue) {
          return sortState.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortState.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
  }, [items, searchText, sortState]);

  if (error) {
    return <div>Error Loading Auction Items ...</div>;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  /**
   * Changes the sort state based on the current state and the column header that was clicked.
   * The SortableHeader component will call this function when a header is clicked,
   * passing in the name of the column and the next sort direction.
   * This function will update the sort state, which can then be used to sort the auction items accordingly.
   * @param next
   */
  const handleChangeSort = (next: SortState) => {
    setSortState(next);
  };

  const handleOpenUploadItems = () => {
    setFormSession(prev => ++prev);
    uploadItemsRef.current?.open();
  };

  const handleAddItem = () => {
    setFormSession(prev => ++prev);
    addItemRef.current?.open();
  };

   const handleEditItem = (item: ItemType) => {
     setFormSession((prev) => ++prev);
     setSelectedItem(item);
     editItemRef.current?.open();
   };
 
   const handleDeleteItem = async (item: ItemType) => {
    const isConfirmed = await confirm({
      title: "CONFIRMATION",
      message: `Are you sure you want to delete the item ${item.itemName}?`,
    });

    if (isConfirmed) {
      console.log("in handleConfirm in DeleteItemDialog");

      try {
        const response = await request(
          `/api/events/${event!.galaEventId}/items/${item.itemId}`,
          "DELETE",
        );
        if (response.ok && response.status === 204) {
          getItems(context.eventId);
        }
        //        console.log("Delete response:", response);
      } catch (err: any) {
        alert(`Error deleting item... ${err.message ?? "Unknown error"}`);
      }
    }
  };

  const handleModalConfirm = () => {
    console.log("Modal Dialog confirmed!  Let's reload the items list now!");
    getItems(context.eventId);
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
                placeholder="Search Auction Items"
                value={searchText}
                onChange={handleSearchChange}
              />
            </label>
            <AddActionButton
              label="ADD ITEM"
              onClick={handleAddItem}
              disabled={event?.eventStatusId !== EventStatus.Setup}
            />
            <UploadCsvButton
              label="UPLOAD ITEMS"
              onClick={handleOpenUploadItems}
              disabled={event?.eventStatusId !== EventStatus.Setup}
            />
          </div>
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <thead>
            <tr className="text-lg bg-accent text-white/50">
              <SortableHeader
                name="isPaid"
                label="Paid"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "isPaid" ? sortState.direction : undefined
                }
              />
              <SortableHeader
                name="itemNumber"
                label="Item #"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "itemNumber"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="categoryName"
                label="Category"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "categoryName"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="itemName"
                label="Auction Item"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "itemName"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="winningBidderNumber"
                label="Winning Bidder #"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "winningBidderNumber"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="winningBidderName"
                label="Winning Bidder"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "winningBidderName"
                    ? sortState.direction
                    : undefined
                }
              />
              <Header label="Winning Amount" />
              <Header label="Actions" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="text-lg">
                <td colSpan={7} className="text-lg font-bold text-center">
                  Loading auction items ... please wait
                </td>
              </tr>
            )}
            {!isLoading && filteredItems.length === 0 && (
              <tr className="text-lg">
                <td colSpan={7} className="text-lg font-bold text-center">
                  No auction items found.
                </td>
              </tr>
            )}
            {!isLoading &&
              filteredItems.length > 0 &&
              filteredItems.map(item => (
                <tr key={item.itemId} className="text-lg">
                  <td className="py-1">
                    <input
                      type="checkbox"
                      checked={item.isPaid}
                      className="checkbox checkbox-sm"
                      readOnly
                    />
                  </td>
                  <td className="py-1 font-bold">{item.itemNumber}</td>
                  <td className="py-1">{item.categoryName}</td>
                  <td className="py-1">{item.itemName}</td>
                  <td className="py-1">{item.winningBidderNumber}</td>
                  <td className="py-1">{item.winningBidderName}</td>
                  <td className="py-1">
                    {item.winningBidAmount > 0
                      ? currencyFormatter.format(item.winningBidAmount)
                      : ""}
                  </td>
                  <td className="flex flex-row gap-4 py-1">
                    <EditActionButton
                      onClick={() => handleEditItem(item)}
                      disabled={event?.eventStatusId !== EventStatus.Setup}
                    />
                    <DeleteActionButton
                      onClick={() => handleDeleteItem(item)}
                      disabled={event?.eventStatusId !== EventStatus.Setup}
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
      <AddItemDialog
        key={`addItem-${formSession}`}
        ref={addItemRef}
        onConfirm={handleModalConfirm}
      />
      <EditItemDialog
        key={`editItem-${formSession}`}
        ref={editItemRef}
        onConfirm={handleModalConfirm}
        item={selectedItem}
      />
      <UploadItemsDialog
        key={`upload-${formSession}`}
        ref={uploadItemsRef}
        onConfirm={handleModalConfirm}
      />
    </>
  );
};

export default AuctionItems;
