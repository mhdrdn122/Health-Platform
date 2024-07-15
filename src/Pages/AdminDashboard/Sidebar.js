import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './AdminDashboard.css';
import UserList from './UserList';
import AddUser from './AddUser';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li><Link to="/admin/">All Users</Link></li>
          <li><Link to="add-user">Add User</Link></li>
          <li><Link to="admin-doctors">Doctors</Link></li>
          <li><Link to="/appo">appointments</Link></li>


        </ul>
      </div>
      <div className="content">
        <Routes>
          {/* <Route path="/" element={<UserList />} /> */}
          {/* <Route path="add-user" element={<AddUser />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
