import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import FormPage from './components/FormPage';
import TablePage from './components/TablePage';
import NotFound from './components/NotFound';
import Login from './components/Login'; // Import Login component
import './index.css';

function App() {
  // Custom Hook to get the current location
  const location = useLocation();

  // Define the path(s) where navigation should be hidden
  const hideNavPaths = ['/login', '*'];

  return (
    <div className="container-fluid mb-5">
      {/* Conditionally Render Navbar */}
      {!hideNavPaths.includes(location.pathname) && (
        <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">ReactApp</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/form">Form</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/table">Data Table</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/login" element={<Login />} /> {/* New Login Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

// Wrap App component with Router
function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
