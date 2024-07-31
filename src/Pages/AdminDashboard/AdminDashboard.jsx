import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import Sidebar from '../../Components/AdmindashboardComponents/Sidebar';
import AllUsers from '../../Components/AdmindashboardComponents/AllUsers';
import EditUser from '../../Components/AdmindashboardComponents/EditUser';
import AddUser from '../../Components/AdmindashboardComponents/AddUser';
import DoctorList from '../../Components/AdmindashboardComponents/DoctorList';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("There was an error fetching the users!", error);
        }
    };

    const deleteUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(users.filter(user => user.id !== id));
        } catch (error) {
            console.error("There was an error deleting the user!", error);
        }
    };

    const startEditingUser = (user) => {
        setEditingUser(user);
    };

    const handleEditUserClose = () => {
        setEditingUser(null);
        fetchUsers();
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={
                        editingUser ? <EditUser user={editingUser} onClose={handleEditUserClose} /> : <AllUsers 
                            users={users} 
                            startEditingUser={startEditingUser} 
                            deleteUser={deleteUser} 
                        />
                    } />
                    <Route path="add-user" element={<AddUser onClose={() => fetchUsers()} />} />
                    <Route path="admin-doctors" element={<DoctorList />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
