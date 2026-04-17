import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { GuestType } from "../types/Guest";
import { useHttp } from "../hooks/useHttp";
import EventContext from "../store/EventContext";
import TabNavigation from "../components/TabNavigation";
import { EventStatus } from "../types/EventStatus";
import AddGuestDialog from "../components/guests/AddGuestDialog";
import type { ModalHandle } from "../components/common/Modal";
import UploadGuestsDialog from "../components/guests/UploadGuestsDialog";
import EditGuestDialog from "../components/guests/EditGuestDialog";
import SortableHeader, {
  type SortState,
} from "../components/common/SortableHeader";
import Header from "../components/common/Header";
import EditActionButton from "../components/common/EditActionButton";
import DeleteActionButton from "../components/common/DeleteActionButton";
import UploadCsvButton from "../components/common/UploadCsvButton";
import AddActionButton from "../components/common/AddActionButton";
import { useConfirm } from "../store/ConfirmProvider";
import PrintLabelsButton from "../components/common/PrintLabelsButton";
import PrintLabelsDialog from "../components/guests/PrintLabelsDialog";

const GuestList = () => {
  const context = useContext(EventContext);
  const { request, isLoading, error } = useHttp();
  const [guests, setGuests] = useState<GuestType[]>([] as GuestType[]);
  const [selectedGuest, setSelectedGuest] = useState<GuestType>(
    {} as GuestType,
  );
  const addGuestRef = useRef<ModalHandle>(null);
  const editGuestRef = useRef<ModalHandle>(null);
  const uploadGuestsRef = useRef<ModalHandle>(null);
  const printLabelsRef = useRef<ModalHandle>(null);
  const event = context.event;
  const [formSession, setFormSession] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [sortState, setSortState] = useState<SortState>({
    name: "",
    direction: undefined,
  });
  const confirm = useConfirm();

  useEffect(() => {
    if (context.eventId && context.eventId !== 0) {
      getGuests(context.eventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGuests = async (id: number) => {
    const guestsData = await request(`/api/events/${id}/guests`, "GET");
    setGuests(guestsData);
  };

  const filteredItems = useMemo(() => {
    return guests
      .filter(guest => {
        if (searchText.trim() === "") {
          return true; // If search text is empty, include all guests
        }
        return (
          guest.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          guest.lastName.toLowerCase().includes(searchText.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (!sortState.direction || sortState.name === "") {
          return 0; // No sorting applied
        }
        const aValue = a[sortState.name as keyof GuestType];
        const bValue = b[sortState.name as keyof GuestType];
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
    return <div>Error Loading Guests ...</div>;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onOpenAddGuest = () => {
    setFormSession(prev => ++prev);
    addGuestRef.current?.open();
  };

  const onOpenEditGuest = (guest: GuestType) => {
    setFormSession(prev => ++prev);
    setSelectedGuest(guest);
    editGuestRef.current?.open();
  };

  const handleDeleteGuest = async (guest: GuestType) => {
    const isConfirmed = await confirm({
      title: "CONFIRMATION",
      message: `Are you sure you want to delete the guest ${guest.firstName} ${guest.lastName}?`,
    });

    if (isConfirmed) {
      console.log("in handleConfirm in DeleteGuestDialog");

      try {
        const response = await request(
          `/api/events/${event!.galaEventId}/guests/${guest.guestId}`,
          "DELETE",
        );
        if (response.ok && response.status === 204) {
          getGuests(context.eventId);
        }
        //        console.log("Delete response:", response);
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(`Error deleting guest... ${err.message ?? "Unknown error"}`);
        } else {
          alert("Error deleting guest... Unknown error");
        }
      }
    }
  };

  const onOpenUploadGuests = () => {
    setFormSession(prev => ++prev);
    uploadGuestsRef.current?.open();
  };

  const handleModalConfirm = () => {
    console.log("Modal Dialog confirmed!  Let's reload the guest list now!");
    getGuests(context.eventId);
  };

  const handlePrintLabels = () => {
    printLabelsRef.current?.open();
  };

  /**
   * Changes the sort state based on the current state and the column header that was clicked.
   * The SortableHeader component will call this function when a header is clicked,
   * passing in the name of the column and the next sort direction.
   * This function will update the sort state, which can then be used to sort the guest list accordingly.
   * @param next
   */
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
            <AddActionButton
              label="ADD GUEST"
              onClick={onOpenAddGuest}
              disabled={event?.eventStatusId !== EventStatus.Setup}
            />
            <UploadCsvButton
              label="UPLOAD GUESTS"
              onClick={onOpenUploadGuests}
              disabled={event?.eventStatusId !== EventStatus.Setup}
            />
            <PrintLabelsButton
              label="PRINT LABELS"
              onClick={handlePrintLabels}
              disabled={guests.length === 0}
             />
          </div>
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <thead>
            <tr className="text-lg bg-accent text-white/50">
              <SortableHeader
                name="fullName"
                label="Guest Name"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "fullName"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="tableNumber"
                label="Table #"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "tableNumber"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="inPersonBidderNumber"
                label="Bidder #"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "inPersonBidderNumber"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="onlineBidderNumber"
                label="Online Bidder #"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "onlineBidderNumber"
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
                  <td className="py-1">{guest.fullName}</td>
                  <td className="py-1">{guest.tableNumber}</td>
                  <td className="py-1">{guest.inPersonBidderNumber}</td>
                  <td className="py-1">
                    {guest.onlineBidderNumber ? guest.onlineBidderNumber : "--"}
                  </td>
                  <td className="flex flex-row gap-4 py-1">
                    <EditActionButton
                      onClick={() => onOpenEditGuest(guest)}
                      disabled={event?.eventStatusId !== EventStatus.Setup}
                    />
                    <DeleteActionButton
                      onClick={() => handleDeleteGuest(guest)}
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
      <AddGuestDialog
        key={`add-${formSession}`}
        ref={addGuestRef}
        onConfirm={handleModalConfirm}
      />
      <EditGuestDialog
        key={`edit-${formSession}`}
        ref={editGuestRef}
        onConfirm={handleModalConfirm}
        guest={selectedGuest}
      />
      <UploadGuestsDialog
        key={`upload-${formSession}`}
        ref={uploadGuestsRef}
        onConfirm={handleModalConfirm}
      />
      <PrintLabelsDialog
        key={`print-${formSession}`}
        ref={printLabelsRef}
        onConfirm={handleModalConfirm}
        guests={guests}
      />
    </>
  );
};

export default GuestList;
