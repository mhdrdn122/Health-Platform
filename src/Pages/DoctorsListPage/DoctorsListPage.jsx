import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DoctorsList.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [id , setId] = useState()
  const {auth} = useAuth()

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
    setId(auth.sub.id)

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
    )
    .filter( doctor => doctor.is_verified == true)
    // .filter( doctor =>  doctor.id != id )

    console.log(doctors , filteredDoctors)
  return (
    <div className="doctors-list">
      <h2>الأطباء</h2>
      <div className="controls">
        <input 
          type="text" 
          placeholder="البحث ..." 
          value={searchTerm} 
          onChange={handleSearchChange} 
        />
        <select value={filterSpecialty} onChange={handleFilterChange}>
          <option value="">All Specialties</option>
          <option value="Brain Cancer">Brain Cancer</option>
          <option value="Skin Cancer">Skin Cancer</option>
          {/* <option value="Blood Cancer">Blood Cancer</option> */}
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
              <FontAwesomeIcon icon={faUserCircle} className="profile-icon" style={{ fontSize: "150px", border: "3px solid #0073b1", borderRadius: "50%" }} />

            )}
              <FontAwesomeIcon icon={faCheckCircle} className="verified-icon" />

            <h3>{doctor.first_name} {doctor.last_name}</h3>
            <p>{doctor.specialty}</p>
            <Link to={`/profile/${doctor.id}`} style={{margin:"10px"}}>زيارة الملف الشخصي</Link>
            <Link to={`/chat/${doctor.id}`}>تواصل الآن</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
