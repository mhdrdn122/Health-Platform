import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCheckCircle, faTimes, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const ProfileHeader = ({ doctor, role, verified, notifications, notificationDropdown, setNotificationDropdown, auth, userId }) => {
  return (
    <div className="profile-header">
      {doctor.profile_pic ? (
        <img
          src={`data:image/jpeg;base64,${btoa(doctor.profile_pic.data)}`}
          alt="Profile"
          className="profile-pic"
        />
      ) : (
        <FontAwesomeIcon icon={faUserCircle} className="profile-icon" style={{ fontSize: "150px", border: "3px solid #0073b1", borderRadius: "50%" }} />
      )}
      <div className="profile-info">
        <h1>{doctor.first_name} {doctor.last_name}</h1>
        <div style={{ display: "flex", alignItems: "center" }}>
          <p className="specialty">{doctor.specialty}</p>
          {role === "doctor" ? (
            !verified ? (
              <div className='not-verified'>
                حسابك غير موثق بعد
                <FontAwesomeIcon
                  icon={faTimes}
                  className="notifiction-icon"
                  onClick={() => setNotificationDropdown(!notificationDropdown)}
                />
              </div>
            ) : (
              <FontAwesomeIcon icon={faCheckCircle} className="verified-icon" />
            )
          ) : (
            <FontAwesomeIcon icon={faCheckCircle} className="verified-icon" />
          )}
        </div>
        <p className="email">{doctor.email}</p>
      </div>
      {auth.sub.id === parseInt(userId) && (
        <div className="navbar-profile">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="notifiction-icon"
            onClick={() => setNotificationDropdown(!notificationDropdown)}
          />
          <span className="notifiction-point"></span>
          {notificationDropdown && (
            <div className="profile-dropdown">
              {notifications.map((item, i) => (
                <div key={i}>
                  <div className="notification">
                    <span className="message">{item.message}</span>
                    <span className="timestamp">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
