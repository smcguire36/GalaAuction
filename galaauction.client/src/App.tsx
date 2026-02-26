import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
    return (<>
        <div className="w-screen">
            <div>
                <nav>
                    <Link to="/">Home</Link> | <Link to="/login">Login</Link>
                </nav>
            </div>
        </div>
        <main>
            <Outlet />
        </main>
    </>
    )
}

export default App
