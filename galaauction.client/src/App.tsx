import { Outlet } from 'react-router-dom';
import './App.css';
import PrivateRoute from './PrivateRoute';
import TopNavigation from './components/TopNavigation';

function App() {

    return (<PrivateRoute>
        <div className="w-screen p-5">
            <TopNavigation />
            <main>
                <Outlet />
            </main>
        </div>
    </PrivateRoute>);
}

export default App
