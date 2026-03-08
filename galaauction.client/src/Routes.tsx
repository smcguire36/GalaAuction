import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import ManageEvents from "./pages/ManageEvents";
import GuestList from "./pages/GuestList";
import AuctionItems from "./pages/AuctionItems";
import Closeout from "./pages/Closeout";

const routes = createBrowserRouter([
    // Routes without the main layout
    {
        path: "login",
        element: <LoginPage />,
    },
    // Routes with the main layout
    {
        path: "/",
        element: <App />, // Layout component
        children: [
            {
                index: true, // Matches "/"
                element: <Home />,
            },
            {
                path: "manage-events",
                element: <ManageEvents />
            },
            {
                path: "guests",
                element: <GuestList />
            },
            {
                path: "items",
                element: <AuctionItems />
            },
            {
                path: "closeout",
                element: <Closeout />
            },
            {
                path: "checkout",
                element: <p>Checkout</p>
            },
            {
                path: "audit",
                element: <p>Audit Logs</p>
            }
        ],
    },
]);

export default routes;