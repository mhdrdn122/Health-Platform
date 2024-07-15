import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
// import './Conversation.css';

const socket = io('http://localhost:5000');

const Conversation = () => {
  const { userId, doctorId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.emit('join', { username: userId, room: doctorId });

    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.emit('leave', { username: userId, room: doctorId });
      socket.off();
    };
  }, [userId, doctorId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  return (
    <div className="conversation-container">
      <h2>Conversation between {userId} and {doctorId}</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">{msg}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Conversation;
