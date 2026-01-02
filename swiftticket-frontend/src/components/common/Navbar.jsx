import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Home, Folder, Ticket, User, Activity } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <h2 className="navbar-logo">SwiftTicket</h2>
          <div className="navbar-links">
            <Link to="/dashboard" className="nav-link">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/projects" className="nav-link">
              <Folder size={18} /> Projects
            </Link>
            <Link to="/tickets" className="nav-link">
              <Ticket size={18} /> Tickets
            </Link>
          </div>
        </div>
        <div className="navbar-right">
          <Link to="/profile" className="nav-link profile-link">
            <User size={18} />
            <span className="user-info">
              {user.first_name} {user.last_name}
            </span>
          </Link>

          <Link to="/activity" className="nav-link">
  <Activity size={18} /> Activity
</Link>

          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;