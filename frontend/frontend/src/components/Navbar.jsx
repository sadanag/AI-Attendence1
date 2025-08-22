import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
 

  return (
    <header className="navbar">
      <div className="brand">{user?.companyName || "Priacc Innovations"}</div>
      <nav className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/history">History</Link>
        <Link to="/leave">Leave</Link>
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
         {/* components/Navbar.jsx (add one link) */}
        {user?.role === 'admin' && <Link to="/admin/attendance">All Attendance</Link>}
      </nav>
      <div className="right">
        <span className="username">{user?.name}</span>
        <button className="btn btn-outline" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}