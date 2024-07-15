import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Profile.css';
import { useAuth } from '../../auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Profile = () => {
  const { doctorId } = useParams();
  const userId = doctorId;
  const [doctor, setDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const { auth } = useAuth();
  const [role, setRole] = useState();
  const [specialty , setSpecialty] = useState("")
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    profile_pic: null,
  });
  const [reload , setReload] = useState(0)
  const [notifications , setNotifications] = useState([])
  const [notificationDropdown,setNotificationDropdown] = useState(false)



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

  useEffect( () =>{
    setInterval(() => {
      if (userId) {
        fetchNotifications();
      }
    },  2000);
  },[])
  
  console.log(notifications)

  useEffect(() => {
    const fetchDoctor = async () => {
      const response = await fetch(`http://localhost:5000/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDoctor(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        profile_pic: data.profile_pic ? data.profile_pic.data : null,
      });
      
    };

    let currentRole = localStorage.getItem('role');
    currentRole ? setRole(currentRole) : setRole("");
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
      setEditMode(false);
    } else {
      console.error('Failed to update user', response.status, response.statusText);
    }

    setReload(reload + 1)
  };

  if (!doctor) {
    return <div>Loading...</div>;
  }
  return (
    <div className="profile-container">
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
          <p className="specialty">{doctor.specialty}</p>
          <p className="email">{doctor.email}</p>
        </div>
        

          {auth.sub.id === parseInt(userId) && (
            <div className="navbar-profile">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="notifiction-icon "
              onClick={() => setNotificationDropdown(!notificationDropdown)}
              style={{marginRight :"10px",marginLight :"10px"}}
            />
            <span className="notifiction-point"> </span>
            {notificationDropdown && (
              <div className="profile-dropdown">
                {
                  notifications.map((item,i) => {
                    return(<div key={i}>
                      
                      <div className="notification"> 
                        <span className="message">{item.message}</span>  
                        <span className="timestamp">{item.timestamp}</span>  

                      </div>
                       </div>)
                  })
                }
              </div>

            )}
          </div>
          )}

        <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
          {auth.sub.id === parseInt(userId) && (
            <button onClick={() => setEditMode(true)} className="edit-button">تعديل الملف الشخصي</button>
          )}
          {auth.sub.id === parseInt(userId) && role === "doctor" && (
            <Link to={doctor.specialty == "Brain Cancer" ? `/lab` : `/lab-skin`} className="edit-button" style={{ marginTop: "10px" }}>الذهاب الى المختبر </Link>
            
          )}
          {role === "patient" && (auth.sub.id != parseInt(userId)) ? (
            <Link to={`/appo/${userId}`} className="edit-button" style={{ marginTop: "10px" }}>أحجز موعد</Link>
          ):null}
          {role === "patient" && (auth.sub.id != parseInt(userId)) ? (
            <Link to={`/chat/${userId}`} className="edit-button" style={{ marginTop: "10px" }}> تواصل الآن</Link>
          ):null}
          {role === "doctor" && (
            <Link to={`/appoD/${userId}`} className="edit-button" style={{ marginTop: "10px" }}>المواعيد</Link>
          )}

            {auth.sub.id === parseInt(userId) && (
            <Link to={`/chat-list/${userId}`} className="edit-button" style={{ marginTop: "10px" }}>المحادثات</Link>
          )}
        </div>

        
      </div>
      <div className="profile-bio">
        <h2>السيرة الذاتية</h2>
        <p>{doctor.bio}</p>
      </div>

      {editMode && (
        <form className="edit-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
          />
          {role !== "patient" && (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              required
            />
          )}
          <input type="file" name="profile_pic" onChange={handleFileChange} />
          <button type="submit" className="save-button">Save</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
