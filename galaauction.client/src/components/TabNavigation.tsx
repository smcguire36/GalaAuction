import { Link, useLocation } from "react-router-dom";
import EventContext from "../store/EventContext";
import { useContext } from "react";
import { EventStatus } from "../types/EventStatus";

const isActive = (tab: string, page: string|undefined, ): string => {
    const activeStyles = "tab-active font-bold";

    if (tab === page) {
        return activeStyles;
    }
    return "";
};

const isDisabled = (tab: string, status: number|undefined, ): string => {
    const disabledStyles = "tab-disabled";
    let styles = "";

    if (status === undefined) return disabledStyles;

    switch (status) {
        case EventStatus.Setup:
            if (tab === "closeout" || tab === "checkout") styles = disabledStyles;
            break;
        case EventStatus.Active:
            if (tab === "closeout" || tab === "checkout") styles = disabledStyles;
            break;
        case EventStatus.Closeout:
            if (tab === "guests" || tab === "items") styles = disabledStyles;
            if (tab === "checkout") styles = disabledStyles;
            break;
        case EventStatus.Checkout:
            if (tab === "guests" || tab === "items") styles = disabledStyles;
            break;
        case EventStatus.Closed:
            // No tabs are disabled (but all will be read only)
            break;
    }

    return styles;
};

const TabNavigation = () => {
    const location = useLocation();
    const { event } = useContext(EventContext);

    // Setup Tabset properties
    const thisPage = location.pathname.split("/").at(-1);

    return (
        <div className="tabs tabs-border tabs-lg">
            <Link to="/guests" role="tab" className={`tab ${isActive("guests",thisPage)} ${isDisabled("guests", event?.eventStatusId)}`}>Guest List</Link>
            <Link to="/items" role="tab" className={`tab ${isActive("items",thisPage)} ${isDisabled("items", event?.eventStatusId)}`}>Auction Items</Link>
            <Link to="/closeout" role="tab" className={`tab ${isActive("closeout",thisPage)} ${isDisabled("closeout", event?.eventStatusId)}`}>Closeout</Link>
            <Link to="/checkout" role="tab" className={`tab ${isActive("checkout",thisPage)} ${isDisabled("checkout", event?.eventStatusId)}`}>Checkout</Link>
            <Link to="/reports" role="tab" className={`tab ${isActive("reports",thisPage)} ${isDisabled("reports", event?.eventStatusId)}`}>Reports</Link>
            {/* <Link to="/audit" role="tab" className={`tab ${isActive("audit",thisPage)}`}>Audit Logs</Link> */}
        </div>
    );
};

export default TabNavigation;