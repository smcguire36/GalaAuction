import { use, useEffect, useMemo, useRef, useState } from "react";
import SortableHeader, {
  type SortState,
} from "../components/common/SortableHeader";
import { useHttp } from "../hooks/useHttp";
import Header from "../components/common/Header";
import EditActionButton from "../components/common/EditActionButton";
import DeleteActionButton from "../components/common/DeleteActionButton";
import { EventStatus } from "../types/EventStatus";
import AddActionButton from "../components/common/AddActionButton";
import type { GalaEventDto } from "../dto/GalaEventDto";
import AddEventDialog from "../components/events/AddEventDialog";
import { Modal, type ModalHandle } from "../components/common/Modal";
import { ModalContext } from "../store/ModalContext";
import EditEventDialog from "../components/events/EditEventDialog";

const formatDateAsStored = (dateStr: string) => {
  // dateStr is "2026-04-15"
  const date = new Date(`${dateStr}T00:00:00Z`); // Explicitly set to UTC midnight

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", // CRITICAL: Forces it to ignore local user timezone
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const ManageEvents = () => {
  const { request, isLoading, error } = useHttp();
  const [events, setEvents] = useState<GalaEventDto[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortState, setSortState] = useState<SortState>({
    name: "",
    direction: undefined,
  });
  const addEventRef = useRef<ModalHandle>(null);
  const editEventRef = useRef<ModalHandle>(null);
  const { open, close } = use(ModalContext);
  const [selectedEvent, setSelectedEvent] = useState<GalaEventDto | null>(null);
  const [formSession, setFormSession] = useState<number>(0);

  useEffect(() => {
    getEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEvents = async () => {
    const eventsData = await request(`/api/events`, "GET");
    setEvents(eventsData);
  };

  const filteredItems = useMemo(() => {
    return events
      .filter((event) => {
        if (searchText.trim() === "") {
          return true; // If search text is empty, include all events
        }
        return (
          event.eventName.toLowerCase().includes(searchText.toLowerCase()) ||
          event.organizationName
            .toLowerCase()
            .includes(searchText.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (!sortState.direction || sortState.name === "") {
          return 0; // No sorting applied
        }
        const aValue = a[sortState.name as keyof GalaEventDto];
        const bValue = b[sortState.name as keyof GalaEventDto];
        if (aValue < bValue) {
          return sortState.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortState.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
  }, [events, searchText, sortState]);

  if (error) {
    return <div>Error Loading Events ...</div>;
  }

  /**
   * Changes the sort state based on the current state and the column header that was clicked.
   * The SortableHeader component will call this function when a header is clicked,
   * passing in the name of the column and the next sort direction.
   * This function will update the sort state, which can then be used to sort the event list accordingly.
   * @param next
   */
  const handleChangeSort = (next: SortState) => {
    setSortState(next);
  };

  const handleAddEvent = () => {
    setFormSession((prev) => prev + 1); // Increment form session to force remount of AddEventDialog and reset its internal state
    addEventRef.current?.open();
  };

  const handleAddEventConfirm = () => {
    // After an event is added, we want to refresh the event list to show the new event.
    getEvents();
  };

  const handleEditEvent = (event: GalaEventDto) => {
    setFormSession((prev) => prev + 1); // Increment form session to force remount of EditEventDialog and reset its internal state
    setSelectedEvent(event);
    editEventRef.current?.open();
  };

  const handleEditEventConfirm = () => {
    // After an event is edited, we want to refresh the event list to show the updated event.
    setSelectedEvent(null);
    getEvents();
  };

  const handleDeleteEvent = (event: GalaEventDto) => {
    setSelectedEvent(event);
    // Open the delete confirmation modal
    open("delete-event-confirmation");
  };

  const handleDeleteConfirm = async () => {
    if (selectedEvent) {
      await request(`/api/events/${selectedEvent.galaEventId}`, "DELETE");
      close();
      getEvents();
    }
  };

  return (
    <>
      <div className="flex flex-row items-center pt-2">
        <div className="flex-initial">
          <p className="text-2xl font-bold">Manage Events</p>
        </div>
        <div className="flex-auto text-right">
          <div className="flex items-center flex-row-reverse gap-2">
            <AddActionButton label="ADD EVENT" onClick={handleAddEvent} />
          </div>
        </div>
      </div>

      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <thead>
            <tr className="text-lg bg-accent text-white/50">
              <SortableHeader
                name="eventName"
                label="Event Name"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "eventName"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="organizationName"
                label="Organization Name"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "organizationName"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="eventDate"
                label="Event Date"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "eventDate"
                    ? sortState.direction
                    : undefined
                }
              />
              <SortableHeader
                name="eventStatus"
                label="Event Status"
                changeSort={handleChangeSort}
                sortDirection={
                  sortState.name === "eventStatus"
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
                  Loading events ... please wait
                </td>
              </tr>
            )}
            {!isLoading && filteredItems.length === 0 && (
              <tr className="text-lg">
                <td colSpan={5} className="text-lg font-bold text-center">
                  No events found.
                </td>
              </tr>
            )}
            {!isLoading &&
              filteredItems.length > 0 &&
              filteredItems.map((event) => (
                <tr key={event.galaEventId} className="text-lg">
                  <td className="py-1">{event.eventName}</td>
                  <td className="py-1">{event.organizationName}</td>
                  <td className="py-1">
                    {formatDateAsStored(event.eventDate)}
                  </td>
                  <td className="py-1">{event.eventStatusText}</td>
                  <td className="flex flex-row gap-4 py-1">
                    <EditActionButton
                      onClick={() => handleEditEvent(event)}
                      disabled={event?.eventStatusId !== EventStatus.Setup}
                    />
                    <DeleteActionButton
                      onClick={() => handleDeleteEvent(event)}
                      disabled={
                        event?.eventStatusId !== EventStatus.Setup &&
                        event?.eventStatusId !== EventStatus.Closed
                      }
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
      <AddEventDialog
        key={`add-${formSession}`}
        ref={addEventRef}
        onConfirm={handleAddEventConfirm}
      />
      <EditEventDialog
        key={`edit-${formSession}`}
        ref={editEventRef}
        onConfirm={handleEditEventConfirm}
        galaEvent={selectedEvent}
      />

      <Modal
        id="delete-event-confirmation"
        title="CONFIRM EVENT DELETION"
        customVariant="confirm"
        onClose={() => setSelectedEvent(null)}
        onConfirm={handleDeleteConfirm}
      >
        <p>
          Are you sure you want to delete event: {selectedEvent?.eventName}?
        </p>
      </Modal>
    </>
  );
};

export default ManageEvents;
