import { useEffect, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import { type GalaEventType } from "../types/GalaEvent";
import EventContext, { type EventState, EVENT_DEFAULTS } from "./EventContext";

const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = usePersistedState("gala-auction-theme", EVENT_DEFAULTS.theme);
    const [eventId, setEventId] = usePersistedState("gala-auction-event", "0");
    const [event, setEvent] = useState<GalaEventType|null>(null);

    const setGalaEvent = (newEvent:GalaEventType) => {
        setEvent(newEvent);
        setEventId(newEvent.galaEventId.toString());
    }; 

    const setEventStatus = (newStatus: number, newStatusText: string) => {
        if (event === null) {
            return;
        }
        const updated_event = 
        {
            ...event, 
            eventStatusId: newStatus,         // Update status value
            eventStatusText: newStatusText  // Update status text value
        };
        setEvent(updated_event as GalaEventType);
        setEventId(updated_event.galaEventId.toString());
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