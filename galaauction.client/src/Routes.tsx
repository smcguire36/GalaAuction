import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

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
        ],
    },
]);

export default routes;