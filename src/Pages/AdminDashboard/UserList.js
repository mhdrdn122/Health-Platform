import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/users', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setUsers(response.data);
    }).catch(error => {
      console.error("There was an error fetching the users!", error);
    });
  };

  const deleteUser = (id) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:5000/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setUsers(users.filter(user => user.id !== id));
    }).catch(error => {
      console.error("There was an error deleting the user!", error);
    });
  };

  return (
    <div>
      <h2>All Users</h2>
      <table>
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
                <button onClick={() => console.log(`Edit user ${user.id}`)}>Edit</button>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
