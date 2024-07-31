import React from 'react';
import { Link } from 'react-router-dom';
import './style/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li><Link to="/admin/">All Users</Link></li>
          <li><Link to="add-user">Add User</Link></li>
          <li><Link to="admin-doctors">Doctors</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
