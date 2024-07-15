import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddUser.css';
import { useNavigate } from 'react-router-dom';

function AddUser() {
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    is_doctor: false,
    is_admin:false,
    specialty: ''
  });
  const [specialties, setSpecialties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch specialties from the server
    axios.get('http://localhost:5000/specialties', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setSpecialties(response.data);
    })
    .catch(error => {
      console.error("There was an error fetching the specialties!", error);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));

  };
  console.log(user)

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/users', user, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      console.log(response.data);
      navigate('/admin/');
    })
    .catch(error => {
      console.error("There was an error creating the user!", error);
    });
  };

  return (
    <div className="add-user">
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input type="text" name="first_name" value={user.first_name} onChange={handleChange} required />
        </label>
        <label>
          Last Name:
          <input type="text" name="last_name" value={user.last_name} onChange={handleChange} required />
        </label>
        <label>
          Email:
          <input type="email" name="email" value={user.email} onChange={handleChange} required />
        </label>
        <label>
          Password:
          <input type="password" name="password" value={user.password} onChange={handleChange} required />
        </label>
        <label>
          Is Doctor:
          <input type="checkbox" name="is_doctor" checked={user.is_doctor} onChange={handleChange} />
        </label>
        <label>
          Is Admin:
          <input type="checkbox" name="is_admin" checked={user.is_admin} onChange={handleChange} />
        </label>
        {user.is_doctor && (
          <label>
            Specialty:
            <select name="specialty" value={user.specialty} onChange={handleChange} required>
              <option value="">Select a specialty</option>
              {specialties.map(specialty => (
                <option key={specialty.id} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default AddUser;
