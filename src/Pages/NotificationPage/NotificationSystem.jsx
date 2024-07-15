// NotificationSystem.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';
import './style.css';

const NotificationSystem = () => {
  const [userId, setUserId] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (userId) {
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

      fetchNotifications();

      const socket = io('http://localhost:5000');
      socket.on('notification', (notification) => {
        if (notification.user_id === userId) {
          toast(notification.message);
          setNotifications((prevNotifications) => [...prevNotifications, notification]);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [userId]);

  return (
    <div>
      <h2>Notifications</h2>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id} style={{ color: notification.is_read ? 'black' : 'red' }}>
            {notification.message} - <span>{notification.timestamp}</span>
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
};

export default NotificationSystem;
