import { Outlet } from "react-router-dom";
import "./App.css";
import TopNavigation from "./components/TopNavigation";

function App() {
  return (
    <div className="w-lvw p-2 flex flex-col h-lvh">
      <TopNavigation />
      <Outlet />
    </div>
  );
}

export default App;
