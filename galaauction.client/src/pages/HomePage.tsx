import { useEffect, useState } from "react";
import { useHttp } from "../hooks/useHttp";
import type { GalaEventType } from "../types/GalaEvent";
import { useKeycloak } from "@react-keycloak/web";

const HomePage = () => {
    const { request, isLoading, error } = useHttp();
    const [ events, setEvents ] = useState<GalaEventType[]>();
    const { keycloak, initialized } = useKeycloak();

    useEffect(() => {
        const getEvents = async () => {
            const eventData = await request('/api/events','GET');
            setEvents(eventData);
            console.log(eventData);
        };
        getEvents();
    }, []);

    return (<>
        <span className="text-xl font-bold">Home Page</span>

        <div className="flex flex-col items-center gap-4 p-10">
            <h1 className="text-3xl font-bold">
                Hello React + daisyUI!
            </h1>
            <button className="btn btn-primary w-40">Click Me</button>
        </div>

        { initialized && (
            <p>token: {keycloak.token}</p>
        )}

        <div className="flex items-center gap-4 p-10">
            { !isLoading && events && (events.map((event) => (
                <p key={event.galaEventId}>{event.eventName}</p>
            )))}
            { isLoading && <>
                <p>Events are loading...</p>
            </>}
            { error && (
                <p>Error: {error}</p>
            )}
        </div>
    </>);
}

export default HomePage;