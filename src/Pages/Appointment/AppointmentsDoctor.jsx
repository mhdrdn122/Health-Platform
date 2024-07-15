import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AppointmentsDoctor.css';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../auth';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const doctorId = useParams().id;

    const {handleSendNotification} = useAuth()
    const getAppointments = async () => {
        await axios.get(`http://localhost:5000/appointments/doctor/${doctorId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => setAppointments(response.data))
        .catch(error => console.error('Error fetching appointments:', error));
    };

    useEffect(() => {
        getAppointments();
    }, [doctorId]);

    const handleApprove = (appointmentId ,appointmentPatientId ) => {
        handleSendNotification(appointmentPatientId , "لقد تم الموافقة موعدك ")
        axios.put(`http://localhost:5000/appointments/${appointmentId}/approve`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setAppointments(appointments.map(appointment => 
                appointment.id === appointmentId 
                ? { ...appointment, is_approved: response.data.is_approved }
                : appointment
            ));
            toast.success("Appointment approved successfully!");
        })
        .catch(error => {
            console.error('Error updating appointment:', error);
            toast.error("Failed to approve appointment.");
        });
    };

    const handleDelete = (appointmentId) => {
        axios.delete(`http://localhost:5000/appointments/${appointmentId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(() => {
            setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
            toast.success("Appointment deleted successfully!");
        })
        .catch(error => {
            console.error('Error deleting appointment:', error);
            toast.error("Failed to delete appointment.");
        });
    };

    const handleToggleComplete = (appointmentId) => {
        axios.put(`http://localhost:5000/appointments/${appointmentId}/toggle_complete`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setAppointments(appointments.map(appointment => 
                appointment.id === appointmentId 
                ? { ...appointment, is_completed: response.data.is_completed }
                : appointment
            ));
            toast.success("Appointment completion status updated!");
        })
        .catch(error => {
            console.error('Error toggling complete status:', error);
            toast.error("Failed to update completion status.");
        });
    };
        console.log(appointments[0])

    return (
        <div className="appointments-container">
            <ToastContainer />
            <table className="appointments-table">
                <thead>
                    <tr>
                        <th>Patient Name</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th>Date & Time</th>
                        <th>Approval</th>
                        <th>Completed</th>
                        <th>Actions</th>
                    </tr>
                </thead> 
                <tbody>
                    {appointments.map(appointment => (
                        <tr key={appointment.id}>
                            <td>{appointment.patient_name}</td>
                            <td>{appointment.patient_phone}</td>
                            <td>{appointment.patient_gender}</td>
                            <td>{appointment.datetime}</td>
                            <td>
                                <button 
                                    className={`approve-button ${appointment.is_approved ? 'approved' : 'not-approved'}`}
                                    onClick={() => handleApprove(appointment.id,appointment.patient_id
                                    )}
                                    disabled={appointment.is_approved}
                                >
                                    {appointment.is_approved ? 'Approved' : 'Approve'}
                                </button>
                            </td>
                            <td>
                                <FontAwesomeIcon 
                                    icon={appointment.is_completed ? faCheck : faTimes} 
                                    className={`completion-icon ${appointment.is_completed ? 'completed' : 'not-completed'}`}
                                    onClick={() => handleToggleComplete(appointment.id)}
                                />
                            </td>
                            <td>
                                <FontAwesomeIcon 
                                    icon={faTrash} 
                                    className="delete-icon"
                                    onClick={() => handleDelete(appointment.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Appointments;
