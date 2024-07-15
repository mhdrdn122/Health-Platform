import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './doctordetails.css';
import { useAuth } from '../../auth';

const DoctorDetails = () => {
    const [doctor, setDoctor] = useState(null);
    const  doctorId  = useParams();
    const navigate = useNavigate();
  const { handleSendNotification } = useAuth();


    useEffect(() => {
        fetchDoctorDetails();
    }, [doctorId]);
console.log(doctorId)
    const fetchDoctorDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/doctor/${doctorId.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDoctor(response.data);
        } catch (error) {
            console.error("There was an error fetching the doctor details!", error);
        }
    };

    const verifyDoctor = async () => {

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/doctor/verify/${doctorId.id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/admin/doctors');
            handleSendNotification(doctorId.id , "لقد تم توثيق حسابك")
        } catch (error) {
            console.error("There was an error verifying the doctor!", error);
        }
    };

    const rejectDoctor = () => {
        handleSendNotification(doctorId.id , " لقد تم رفض توثيق حسابك يرجى التأكد من معلوماتك")

    };

    if (!doctor) return <div>Loading...</div>;

    return (
        <div className="doctor-details">
            <div className="profile-header">
                <img src={`data:image/png;base64,${btoa(doctor.profile_picture)}`} alt="Profile" className="profile-picture"/>
                <h2>{doctor.full_name}</h2>
                <p>{doctor.degree} - {doctor.issuing_authority}</p>
                <p>{doctor.experience_years} سنوات خبرة</p>
            </div>
            <div className="profile-body">
                <div className="info-section">
                    <h3>معلومات شخصية</h3>
                    <p><strong>العنوان:</strong> {doctor.address}</p>
                    <p><strong>الهاتف:</strong> {doctor.phone_number}</p>
                    <p><strong>البريد الإلكتروني:</strong> {doctor.email}</p>
                </div>
                <div className="info-section">
                    <h3>معلومات العيادة</h3>
                    <p><strong>عنوان العيادة:</strong> {doctor.clinic_address}</p>
                </div>
                <div className="info-section">
                    <h3>العضويات المهنية</h3>
                    <p><strong>العضوية:</strong> {doctor.professional_membership}</p>
                    <p><strong>رقم العضوية:</strong> {doctor.membership_number}</p>
                </div>
                <div className="info-section">
                    <h3>الشهادات والتراخيص</h3>
                    <p><strong>رقم الترخيص:</strong> {doctor.license_number}</p>
                    <img src={`data:image/png;base64,${btoa(doctor.license_certificate)}`} alt="License Certificate" className="certificate"/>
                    <img src={`data:image/png;base64,${btoa(doctor.degree_certificate)}`} alt="Degree Certificate" className="certificate"/>
                </div>
                <div className="info-section">
                    <h3>وثيقة الهوية</h3>
                    <img src={`data:image/png;base64,${btoa(doctor.identity_document)}`} alt="Identity Document" className="identity-document"/>
                </div>
            </div>
            <div className="profile-actions">
                <button className="verify-button" onClick={verifyDoctor}>تأكيد الطبيب</button>
                <button className="reject-button" onClick={rejectDoctor}>رفض الطبيب</button>
            </div>
        </div>
    );
};

export default DoctorDetails;
