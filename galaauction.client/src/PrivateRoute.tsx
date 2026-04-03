import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState, type ReactNode } from "react";
import loginImage from "./assets/login_background.png";

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // 1. Set a minimum splash screen duration (e.g., 2 seconds)
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 100);

    return () => clearTimeout(timer); // Cleanup timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1. Wait for Keycloak to finish initializing or wait a minimum of 3.5 seconds
  if (!initialized || !minTimeElapsed) {
    // If keycloak is initialized and the user is NOT authenticated...
    if (initialized && !keycloak.authenticated) {
      // Skip the splash screen
    } 
    // otherwise return and display the splash screen
    // NOTE: this prevents the splash screen from hanging around when it's just going to redirect to keycloak login page anyway
    else {
      return (
        <div
          className="hero min-h-screen bg-base-300 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${loginImage})` }}
        >
          <div className="hero-content text-center">
            <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl p-4 flex flex-col gap-2">
              <div className="text-3xl">Initializing ... Please Wait</div>
              <div className="flex flex-row items-center justify-center">
                <svg
                  className="animate-spin h-10 w-10"
                  xmlns="http://www.w3.org"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // 2. If not authenticated, redirect to Keycloak login
  // Note: keycloak.login() will perform a full-page redirect
  if (!keycloak.authenticated) {
    keycloak.login();
    return <div>Redirecting to login...</div>;
  }

  // 3. If authenticated, render the protected content
  return children;
};

export default PrivateRoute;
