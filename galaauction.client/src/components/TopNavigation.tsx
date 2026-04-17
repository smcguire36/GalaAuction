import { useKeycloak } from "@react-keycloak/web";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal } from "./common/Modal";
import ThemeToggle from "./ThemeToggle";
import { use, useContext, useRef, useState } from "react";
import EventContext from "../store/EventContext";
import { ModalContext } from "../store/ModalContext";
import { EventStatus } from "../types/EventStatus";
import { useConfirm } from "../store/ConfirmProvider";
import SelectEventDialog from "./events/SelectEventDialog";

const TopNavigation = () => {
  const { keycloak } = useKeycloak();
  const { open } = use(ModalContext);
  const context = useContext(EventContext);
  const event = context.event;
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirm();
  // Setup Tabset properties
  const thisPage = location.pathname.split("/").at(-1);
  const showStatus = (thisPage !== "manage-events");
  const selectEventDialogRef = useRef<{ open: () => void }>(null);
  const [selectEventSession, setSelectEventSession] = useState(0); // Used to force remounting of SelectEventDialog to reset its internal state when opening it multiple times in a row without selecting a different event in between

  if (!keycloak.authenticated) {
    return <p>Not authenticated...</p>;
  }
  const username = keycloak.idTokenParsed!.preferred_username;

  const selectEvent = () => {
    setSelectEventSession((prev) => prev + 1); // Increment the session to force remounting
    selectEventDialogRef.current?.open();
  };

  const handleSelectEventConfirm = () => {
    // Navigate to home page after selecting event
    navigate("/");
  };

  const openSettings = () => {
    open("settings");
  };

  const onSettingsClosed = () => {
    //        alert("Settings Closed");
  };

  const logoutUser = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  const setEventStatus = (statusId: number, statusText: string) => {
    context.setStatus(statusId, statusText);
    setTimeout(() => {
      if (
        (statusId === EventStatus.Setup || statusId === EventStatus.Active) &&
        (thisPage === "guests" || thisPage === "items")
      ) {
        return;
      }
      navigate("/");
    }, 500);
  };

  const handleStartCloseout = async () => {
    const isConfirmed = await confirm({
      title: "CONFIRMATION",
      message: `Are you sure you want to start the closeout process for the ${event?.eventName} event?`,
    });

    if (isConfirmed) {
      setEventStatus(EventStatus.Closeout, "Closeout");
    }
  };

  const handleCancelCloseout = async () => {
    const isConfirmed = await confirm({
      title: "CONFIRMATION",
      message: `Are you sure you want to cancel the closeout process for the ${event?.eventName} event?`,
    });

    if (isConfirmed) {
      setEventStatus(EventStatus.Active, "Active");
    }
  };

  // Setup Event/Status button properties
  let selectedEvent: string = "Select Event";
  let selectedEventColor: string = "btn-warning";
  if (event && event.galaEventId !== 0) {
    selectedEvent = `${event?.eventName} (${event?.eventStatusText})`;
    selectedEventColor = "btn-outline";
  }

  return (
    <>
      <div className="navbar border-b-2 border-b-accent relative z-50">
        <div className="navbar-start flex-1">
          <div className="flex flex-row gap-2">
            <button
              className={`btn ${selectedEventColor}`}
              onClick={selectEvent}
              hidden={!showStatus}
            >
              {selectedEvent.toUpperCase()}
            </button>
            <button
              className="btn btn-outline"
              onClick={selectEvent}
              hidden={showStatus}
            >
              SELECT EVENT
            </button>
            {event?.galaEventId !== 0 && showStatus && (
              <>
                {event?.eventStatusId === EventStatus.Setup && (
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => setEventStatus(EventStatus.Active, "Active")}
                  >
                    MAKE ACTIVE
                  </button>
                )}
                {event?.eventStatusId === EventStatus.Active && (
                  <>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => setEventStatus(EventStatus.Setup, "Setup")}
                    >
                      RETURN TO SETUP
                    </button>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={handleStartCloseout}
                    >
                      START CLOSEOUT
                    </button>
                  </>
                )}
                {event?.eventStatusId === EventStatus.Closeout && (
                  <>
                    <button
                      type="button"
                      className="btn bg-warning/50 border-warning/50 text-warning-content hover:bg-warning"
                      onClick={handleCancelCloseout}
                    >
                      CANCEL CLOSEOUT
                    </button>
                    <button
                      type="button"
                      className="btn bg-accent/50 border-accent/50 text-accent-content hover:bg-accent"
                      onClick={() =>
                        setEventStatus(EventStatus.Checkout, "Checkout")
                      }
                    >
                      START CHECKOUT
                    </button>
                  </>
                )}
                {event?.eventStatusId === EventStatus.Checkout && (
                  <>
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() =>
                        setEventStatus(EventStatus.Closeout, "Closeout")
                      }
                    >
                      RETURN TO CLOSEOUT
                    </button>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={() =>
                        setEventStatus(EventStatus.Closed, "Closed")
                      }
                    >
                      CLOSE EVENT
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="navbar-end space-x-2">
          <ul className="menu menu-horizontal px-1">
            <li>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={openSettings}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
            <li>
              <details>
                <summary className="btn btn-ghost">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {username.toUpperCase()}
                </summary>
                <ul className="z-1 w-40 bg-base-100 p-2">
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <button onClick={logoutUser}>Logout</button>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>

      <Modal
        id="settings"
        title="Settings"
        customVariant="close"
        onClose={onSettingsClosed}
      >
        <ThemeToggle />
      </Modal>

      <SelectEventDialog key={selectEventSession} ref={selectEventDialogRef} onConfirm={handleSelectEventConfirm} />
    </>
  );
};

export default TopNavigation;
