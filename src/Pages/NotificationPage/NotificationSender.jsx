// SendNotification.jsx
import React, { useState } from 'react';
import axios from 'axios';

const NotificationSender = () => {
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    try {
      await axios.post('http://localhost:5000/notifications', {
        user_id: userId,
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Notification sent successfully');
      setUserId('');
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div>
      <h2>Send Notification</h2>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default NotificationSender;
