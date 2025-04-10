import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">App</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/templates">Templates</Link> {/* Link to Templates page */}
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/createTemplate">Create template</Link> {/* Link to Templates page */}
          </li>
          
          {/* Role-based navigation */}
          {user && user.role === 'admin' && (
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link> {/* Only visible to admin */}
            </li>
          )}
          
          {!user ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/signup">Sign Up</Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">Profile</Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={logout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
