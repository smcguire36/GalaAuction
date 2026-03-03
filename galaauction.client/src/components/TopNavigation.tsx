import { useKeycloak } from '@react-keycloak/web';
import { Link } from 'react-router-dom';
import { Modal } from './common/Modal';
import ThemeToggle from './ThemeToggle';
import { useModal } from '../hooks/useModal';
import { useContext } from 'react';
import EventContext from '../store/EventContext';

const TopNavigation = () => {
    const { keycloak } = useKeycloak();
    const { modalRef:settingsModalRef, openModal:openSettingsModal } = useModal();
    const { modalRef:selectEventModalRef, openModal:openSelectEventModal } = useModal();
    const context = useContext(EventContext);

    if (!keycloak.authenticated) {
        return (<p>Not authenticated...</p>);
    }
    const username = keycloak.idTokenParsed!.preferred_username;

    const selectEvent = () => {
        openSelectEventModal();
    };

    const onSelectEventClosed = () => {
        // Put any after event modal closed actions here
    };

    const openSettings = () => {
        openSettingsModal();
    };

    const onSettingsClosed = () => {
//        alert("Settings Closed");
    };

    const logoutUser = () => {
        keycloak.logout();
    };

    let selectedEvent:string = "Select Event";
    if (context.event.galaEventId !== 0) {
        selectedEvent = `${context.event.eventName} (${context.event.eventStatusText})`;
    }
    
    return (
        <>
            <div className="navbar bg-base-200">
                <div className="navbar-start flex-1">
                    <button className="btn btn-outline" onClick={selectEvent}>{selectedEvent.toUpperCase()}</button>
                </div>
                <div className="navbar-center">
                    {}
                    <Link className="btn btn-secondary" to="/login">MAKE ACTIVE</Link>
                </div>
                <div className="navbar-end space-x-2">
                    <ul className="menu menu-horizontal px-1">
                      <li>
                        <button type="button" className="btn btn-ghost" onClick={openSettings}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                              <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                            </svg>
                        </button>
                      </li>
                      <li>
                        <details>
                          <summary className="btn btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
                            </svg>
                            {username.toUpperCase()}
                          </summary>
                          <ul className="z-1 w-40 bg-base-100 p-2">
                            <li><Link to="/profile">Profile</Link></li>
                            <li><button onClick={logoutUser}>Logout</button></li>
                          </ul>
                        </details>
                      </li>
                    </ul>
                </div>
            </div>
        
            <Modal ref={settingsModalRef} title="Settings" onClose={onSettingsClosed}>
                <ThemeToggle />
            </Modal>

            <Modal ref={selectEventModalRef} title="Select Event" onClose={onSelectEventClosed}>
                <p>Here</p>
            </Modal>
        </>
    );
};

export default TopNavigation;