import { use, useContext, useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import { ModalContext } from "../../store/ModalContext";
import type { GalaEventType } from "../../types/GalaEvent";

const SelectEvent = () => {
    const { close } = use(ModalContext);
    const navigate = useNavigate();
    const context = useContext(EventContext);
    const { request, isLoading, error } = useHttp();
    const [ events, setEvents ] = useState<GalaEventType[]>();
    let existingEventId = 0;

    if (context.event && context.event?.galaEventId) {
        existingEventId = context.event.galaEventId;
    }

    useEffect(() => {
        const getEvents = async () => {
            const eventData = await request('/api/events','GET');
            setEvents(eventData);
        };
        getEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectEvent = (e: ChangeEvent<HTMLSelectElement>) => {
        const eventId = parseInt(e.target.value);
        if (events) {
            const event = events.find((event) => event.galaEventId === eventId);
            context.setEvent(event!);
            close();
        }
    };

    const handleManageEvents = () => {
        navigate("/manage-events");
        close();
    };

    return (
      <fieldset className="flex flex-row gap-4 items-center">
        <select
          className="select select-sm select-bordered border-base-content/20 bg-base-200 shadow-sm flex-1"
          value={existingEventId}
          onChange={handleSelectEvent}
        >
            { !isLoading && events && (
                <option value="0" disabled>Select an event...</option>
            )}
            { !isLoading && events && (events.map((event) => (
                <option key={event.galaEventId} value={event.galaEventId}>{event.eventName}</option>
            )))}
            { isLoading && <>
                <option disabled>Loading events...</option>
            </>}
            { error && (
                <option disabled>Error: {error}</option>
            )}
        </select>
        <button className="btn btn-outline border-base-content/20 bg-base-200 shadow-sm w-20 flex-none" onClick={handleManageEvents}>
            Manage
        </button>
      </fieldset>
    );
};

export default SelectEvent;