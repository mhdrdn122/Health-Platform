import React from 'react';
import { Link } from 'react-router-dom';

const ProfileActions = ({ auth, userId, role, verified, doctor, setEditMode }) => {
  return (
    <div className="profile-actions">
      <Link to={`/`} className="edit-button">الذهاب الى الصفحة الرئيسية</Link>
      {auth.sub.id === parseInt(userId) && (
        <button onClick={() => setEditMode(true)} className="edit-button">تعديل الملف الشخصي</button>
      )}
      {auth.sub.id === parseInt(userId) && role === "doctor" && verified && (
        <Link to={doctor.specialty === "Brain Cancer" ? `/lab-brain` : `/lab-skin`} className="edit-button">الذهاب الى المختبر</Link>
      )}
      {role === "doctor" && verified && (
        <Link to={`/appointments/${userId}`} className="edit-button">المواعيد</Link>
      )}
      {auth.sub.id === parseInt(userId) && (
        <Link to={`/chat-list/${userId}`} className="edit-button">المحادثات</Link>
      )}
      {role === "patient" && (auth.sub.id !== parseInt(userId)) && (
        <Link to={`/appointment/${userId}`} className="edit-button">أحجز موعد</Link>
      )}
      {role === "patient" && (auth.sub.id !== parseInt(userId)) && (
        <Link to={`/chat/${userId}`} className="edit-button">تواصل الآن</Link>
      )}
    </div>
  );
};

export default ProfileActions;
