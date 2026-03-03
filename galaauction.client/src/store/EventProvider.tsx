import { useEffect } from "react";
import usePersistedState from "../hooks/usePersistedState";
import { type GalaEventType } from "../types/GalaEvent";
import EventContext, { type EventState, EVENT_DEFAULTS } from "./EventContext";

const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = usePersistedState("gala-auction-theme", EVENT_DEFAULTS.theme);
    const [event, setEvent] = usePersistedState("gala-auction-event", JSON.stringify(EVENT_DEFAULTS.event as GalaEventType));

    const setGalaEvent = (newEvent:GalaEventType) => {
        setEvent(JSON.stringify(newEvent));
    };

    const setEventStatus = (newStatus: number, newStatusText: string) => {
        const existing_event = JSON.parse(event);
        const updated_event = 
        {
            ...existing_event, 
            eventStatusId: newStatus,         // Update status value
            eventStatusText: newStatusText  // Update status text value
        };
        setEvent(JSON.stringify(updated_event));
    };

    const setDaisyTheme = (newTheme: string) => {
        setTheme(newTheme);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const newState: EventState = {
        event: JSON.parse(event),
        theme: theme,
        setEvent: setGalaEvent,
        setTheme: setDaisyTheme,
        setStatus: setEventStatus
    };

    return <EventContext value={newState}>{children}</EventContext>;
};

export default EventProvider;