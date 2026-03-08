import { useContext } from "react";
import EventContext from "../store/EventContext";
import { Navigate } from "react-router-dom";
import { EventStatus } from "../types/EventStatus";

const Home = () => {
    const { event } = useContext(EventContext);

    if (event) {
        switch (event.eventStatusId) {
            case EventStatus.Setup:
                return <Navigate to="/guests" />;
                break;
            case EventStatus.Active:
                return <Navigate to="/guests" />;
                break;
            case EventStatus.Closeout:
                return <Navigate to="/closeout" />;
                break;
            case EventStatus.Checkout:
                return <Navigate to="/checkout" />;
                break;
            default:
                return <Navigate to="/guests" />;
                break;
        }
    }

    return (<>
        <span className="text-xl font-bold">Home Page</span>

        <div className="flex flex-col items-center gap-4 p-10">
            <h1 className="text-3xl font-bold">
                Welcome to the Gala Auction Application!
            </h1>
            <h3 className="text-xl">
                Please select an event by clicking on the button at the top left
            </h3>
        </div>

    </>);
}

export default Home;