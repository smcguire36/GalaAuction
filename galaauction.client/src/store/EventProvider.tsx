import { useEffect, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import { type GalaEventType } from "../types/GalaEvent";
import EventContext, { type EventState, EVENT_DEFAULTS } from "./EventContext";
import { useHttp } from "../hooks/useHttp";

const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = usePersistedState("gala-auction-theme", EVENT_DEFAULTS.theme);
    const [eventId, setEventId] = usePersistedState("gala-auction-event", "0");
    const [event, setEvent] = useState<GalaEventType|null>(null);
    const { request } = useHttp();

    /**************************************************************
     * Load the persisted event from the API (if there is one)
     *************************************************************/
    useEffect(() => {
        const getEvent = async (id:number) => {
            const existingEvent = await request(`/api/events/${id}`, "GET");
            console.log(existingEvent);
            if (existingEvent) {
                setEvent(existingEvent as GalaEventType);
            }
            else {
                setEvent(EVENT_DEFAULTS.event as GalaEventType);
            }
        };
        if (+eventId !== 0) {
            getEvent(+eventId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setGalaEvent = (newEvent:GalaEventType) => {
        setEvent(newEvent);
        setEventId(newEvent.galaEventId.toString());
    }; 

    const setEventStatus = (newStatus: number, newStatusText: string) => {
        if (event === null) {
            return;
        }

        const updateStatus = async () => {
            const response = await request(`/api/events/${event.galaEventId}/status/${newStatus}`, "PATCH");
            if (response.status == 204) {
                const updated_event = 
                {
                    ...event, 
                    eventStatusId: newStatus,         // Update status value
                    eventStatusText: newStatusText  // Update status text value
                };
                setEvent(updated_event as GalaEventType);
                setEventId(updated_event.galaEventId.toString());                
            }
            else {
                alert("Error updating the event status...");
            }
        };
        updateStatus();

    };

    const setDaisyTheme = (newTheme: string) => {
        setTheme(newTheme);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const newState: EventState = {
        eventId: +eventId,
        event: event,
        theme: theme,
        setEvent: setGalaEvent,
        setTheme: setDaisyTheme,
        setStatus: setEventStatus
    };

    return <EventContext value={newState}>{children}</EventContext>;
};

export default EventProvider;