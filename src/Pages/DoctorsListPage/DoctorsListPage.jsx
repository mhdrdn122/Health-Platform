import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorsList.css';
import { Link } from 'react-router-dom';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/doctors', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setDoctors(response.data);
    })
    .catch(error => {
      console.error('There was an error fetching the doctors!', error);
    });
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterSpecialty(event.target.value);
  };

  const filteredDoctors = doctors
    .filter(doctor => 
      doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(doctor => 
      filterSpecialty ? doctor.specialty === filterSpecialty : true
    );

    console.log(filteredDoctors[0])
  return (
    <div className="doctors-list">
      <h2>Doctors</h2>
      <div className="controls">
        <input 
          type="text" 
          placeholder="Search by name" 
          value={searchTerm} 
          onChange={handleSearchChange} 
        />
        <select value={filterSpecialty} onChange={handleFilterChange}>
          <option value="">All Specialties</option>
          <option value="Brain Cancer">Brain Cancer</option>
          <option value="Skin Cancer">Skin Cancer</option>
          <option value="Blood Cancer">Blood Cancer</option>
        </select>
      </div>
      <div className="doctors-grid">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="doctor-card">

            {doctor.profile_pic ? (
              <img 
                src={`data:image/jpeg;base64,${btoa(doctor.profile_pic)}`} 
                alt="Profile" 
                className="profile-pic" 
              />
            ) : (
              <div className="profile-pic" style={{ backgroundColor: '#f0f0f0' }}></div>
            )}
            <h3>{doctor.first_name} {doctor.last_name}</h3>
            <p>{doctor.specialty}</p>
            <Link to={`/profile/${doctor.id}`} style={{margin:"10px"}}>View Profile</Link>
            <Link to={`/chat/${doctor.id}`}>Chat with Doctor</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
