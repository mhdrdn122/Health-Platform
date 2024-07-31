import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './style/DoctorList.css';

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/doctors', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDoctors(response.data);
        } catch (error) {
            console.error("There was an error fetching the doctors!", error);
        }
    };

    return (
        <div className="doctor-list-container">
            <h2>Doctors</h2>
            <table className="doctors-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Specialty</th>
                        <th>Verified</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map((doctor) => (
                        <tr key={doctor.id}>
                            <td>{doctor.first_name}</td>
                            <td>{doctor.last_name}</td>
                            <td>{doctor.email}</td>
                            <td>{doctor.specialty}</td>
                            <td>{doctor.is_verified ? 'Yes' : 'No'}</td>
                            <td>
                                <Link className="view-details-link" to={`/admin-doctors/${doctor.id}`}>View Details</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ); 
};

export default DoctorList;
