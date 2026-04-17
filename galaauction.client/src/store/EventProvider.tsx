import { useEffect, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import EventContext, { type EventState, EVENT_DEFAULTS } from "./EventContext";
import { useHttp } from "../hooks/useHttp";
import { type GalaEventDto } from "../dto/GalaEventDto";

const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = usePersistedState("gala-auction-theme", EVENT_DEFAULTS.theme);
    const [eventId, setEventId] = usePersistedState("gala-auction-event", "0");
    const [event, setEvent] = useState<GalaEventDto|null>(null);
    const { request } = useHttp();

    /**************************************************************
     * Load the persisted event from the API (if there is one)
     *************************************************************/
    useEffect(() => {
        const getEvent = async (id:number) => {
            const existingEvent = await request(`/api/events/${id}`, "GET");
            if (existingEvent) {
                setEvent(existingEvent as GalaEventDto);
            }
            else {
                setEvent(EVENT_DEFAULTS.event as GalaEventDto);
            }
        };
        if (+eventId !== 0) {
            getEvent(+eventId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setGalaEvent = (newEvent:GalaEventDto) => {
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
                setEvent(updated_event as GalaEventDto);
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