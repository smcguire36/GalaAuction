export type GalaEventDto = {
    galaEventId: number;
    eventName: string;
    eventDate: string;
    organizationName: string;
    thankYouMessage: string;
    eventStatusId: number;
    eventStatusText: string;
};

export const GALAEVENTDEFAULTS: GalaEventDto = {
    galaEventId: 0,
    eventName: "",
    eventDate: "",
    organizationName: "",
    thankYouMessage: "",
    eventStatusId: 0,
    eventStatusText: ""
};
