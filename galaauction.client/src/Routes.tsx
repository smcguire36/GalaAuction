import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ManageEventsPage from "./pages/ManageEventsPage";
import GuestListPage from "./pages/GuestListPage";
import AuctionItemsPage from "./pages/AuctionItemsPage";

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
                element: <HomePage />,
            },
            {
                path: "manage-events",
                element: <ManageEventsPage />
            },
            {
                path: "guests",
                element: <GuestListPage />
            },
            {
                path: "items",
                element: <AuctionItemsPage />
            },
            {
                path: "closeout",
                element: <p>Closeout</p>
            },
            {
                path: "checkout",
                element: <p>Checkout</p>
            }
        ],
    },
]);

export default routes;