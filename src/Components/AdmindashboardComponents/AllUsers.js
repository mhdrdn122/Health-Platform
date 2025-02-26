import React from 'react';
import './style/AllUsers.css';

const AllUsers = ({ users, startEditingUser, deleteUser }) => (
    <div className="all-users-container">
        <h2>All Users</h2>
        <table className="users-table">
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Specialty</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.filter(user => !user.is_admin).map(user => (
                    <tr key={user.id}>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{user.is_doctor ? 'Doctor' : 'Patient'}</td>
                        <td>{user.specialty}</td>
                        <td>
                            <button className="edit-button" onClick={() => startEditingUser(user)}>Edit</button>
                            <button className="delete-button" onClick={() => deleteUser(user.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <h2>Admins</h2>
        <table className="users-table">
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.filter(user => user.is_admin).map(user => (
                    <tr key={user.id}>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.email}</td>
                        <td>
                            <button className="edit-button" onClick={() => startEditingUser(user)}>Edit</button>
                            <button className="delete-button" onClick={() => deleteUser(user.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default AllUsers;
