import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth';
import axios from 'axios';
import ProfileHeader from './../../Components/ProfileComponents/ProfileHeader';
import ProfileActions from './../../Components/ProfileComponents/ProfileActions';
import ProfileBio from './../../Components/ProfileComponents/ProfileBio';
import EditProfileForm from './../../Components/ProfileComponents/EditProfileForm';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const userId = id;
  const [doctor, setDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { auth } = useAuth();
  const [role, setRole] = useState();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    profile_pic: null,
  });
  const [reload, setReload] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [verified, setVerified] = useState();

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/notifications?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) {
        fetchNotifications();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const fetchDoctor = async () => {
      const response = await fetch(`http://localhost:5000/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDoctor(data);
      setVerified(data.verified);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        profile_pic: data.profile_pic ? data.profile_pic.data : null,
      });
    };

    const currentRole = localStorage.getItem('role');
    setRole(currentRole ? currentRole : '');
    fetchDoctor();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      profile_pic: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('first_name', formData.first_name);
    formDataToSend.append('last_name', formData.last_name);
    formDataToSend.append('bio', formData.bio);
    if (formData.profile_pic) {
      formDataToSend.append('profile_pic', formData.profile_pic);
    }

    const response = await fetch(`http://localhost:5000/upload_user/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formDataToSend,
    });

    if (response.ok) {
      const data = await response.json();
      setDoctor(data);
      setFormData({
        ...formData,
        profile_pic: data.profile_pic ? data.profile_pic.data : null,
      });
      setEditMode(false);
    } else {
      console.error('Failed to update user', response.status, response.statusText);
    }
    setReload(reload + 1);
  };

  if (!doctor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
        <div style={{display:"flex" , justifyContent:"space-between" , alignItems:"start"}}>
 <ProfileHeader
        doctor={doctor}
        role={role}
        verified={verified}
        notifications={notifications}
        notificationDropdown={notificationDropdown}
        setNotificationDropdown={setNotificationDropdown}
        auth={auth}
        userId={userId}
      />
      <ProfileActions
        auth={auth}
        userId={userId}
        role={role}
        verified={verified}
        doctor={doctor}
        setEditMode={setEditMode}
      />
        </div>
     
      <ProfileBio doctor={doctor} />
      {editMode && (
        <EditProfileForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          role={role}
        />
      )}
    </div>
  );
};

export default Profile;
