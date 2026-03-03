/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from "react";
import { type GalaEventType } from "../types/GalaEvent";

// eslint-disable-next-line react-refresh/only-export-components
export const EVENT_DEFAULTS = {
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
    event: GalaEventType;
    theme: string;
    setEvent: (newEvent:GalaEventType) => void;
    setTheme: (newTheme:string) => void;
    setStatus: (newStatus:number, newStatusText:string) => void;
};

const EventContext = createContext<EventState>({
    event: EVENT_DEFAULTS.event,
    theme: EVENT_DEFAULTS.theme,
    setEvent: (event) => {},
    setTheme: (newTheme) => {},
    setStatus: (newStatus, newStatusText) => {}
});

export default EventContext;