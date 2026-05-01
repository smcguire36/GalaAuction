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

const ReportsPage = () => {
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
          </div>
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <thead>
            Headers here!
          </thead>
          <tbody>
            Report List Here!
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReportsPage;
