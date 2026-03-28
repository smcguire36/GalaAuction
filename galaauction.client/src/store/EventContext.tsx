/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from "react";
import { type GalaEventType } from "../types/GalaEvent";

// eslint-disable-next-line react-refresh/only-export-components
export const EVENT_DEFAULTS = {
    eventId: 0,
    event: {
        galaEventId: 0,
        eventName: "",
        eventDate: new Date(),
        organizationName: "",
        thankYouMessage:"",
        eventStatusId: 0,
        eventStatusText: ""
    } as GalaEventType,
    theme: "retro"
};

export type EventState = {
    eventId: number;
    event: GalaEventType|null;
    theme: string;
    setEvent: (newEvent:GalaEventType) => void;
    setTheme: (newTheme:string) => void;
    setStatus: (newStatus:number, newStatusText:string) => void;
};

const EventContext = createContext<EventState>({
    eventId: EVENT_DEFAULTS.eventId,
    event: EVENT_DEFAULTS.event,
    theme: EVENT_DEFAULTS.theme,
    setEvent: (_newEvent) => {},
    setTheme: (_newTheme) => {},
    setStatus: (_newStatus, _newStatusText) => {}
});

export default EventContext;