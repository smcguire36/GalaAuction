import { Outlet } from "react-router-dom";
import "./App.css";
import TopNavigation from "./components/TopNavigation";
import { useHttp } from "./hooks/useHttp";
import { useContext, useEffect } from "react";
import EventContext, { EVENT_DEFAULTS } from "./store/EventContext";
import type { GalaEventType } from "./types/GalaEvent";

function App() {
  const { request } = useHttp();
  const context = useContext(EventContext);

  useEffect(() => {

    console.log(context);

    const getEvent = async (id:number) => {
      const existingEvent = await request(`/api/events/${id}`, "GET");
      console.log(existingEvent);
      if (existingEvent) {
        context.setEvent(existingEvent as GalaEventType);
      }
      else {
        context.setEvent(EVENT_DEFAULTS.event as GalaEventType);
      }
    };
    if (context.eventId !== 0) {
        getEvent(context.eventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-lvw p-2 flex flex-col h-lvh">
      <TopNavigation />
      <Outlet />
    </div>
  );
}

export default App;
