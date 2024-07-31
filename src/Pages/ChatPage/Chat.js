import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Chat.css';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const socket = io('http://localhost:5000');

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const recipient = useParams();
  const [user, setUser] = useState({});

  useEffect(() => {
    let token = localStorage.getItem('token');
    let decoded = jwtDecode(token);
    setUser(decoded.sub);
  }, []);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user_status/${recipient.id}`);
        const data = response.data;
        if (data.status) {
          setUserStatus(data.status);
        }
      } catch (error) {
        console.error('حدث خطأ أثناء جلب حالة المستخدم:', error);
      }
    };

    fetchUserStatus();
    const interval = setInterval(fetchUserStatus, 6000);
    return () => clearInterval(interval);
  }, [recipient.id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await axios.post('http://localhost:5000/update_last_seen', { user_id: user.id });
      } catch (error) {
        console.error('حدث خطأ أثناء تحديث آخر ظهور:', error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    socket.on('typing', (data) => {
      if (data.sender_id === recipient.id) {
        setIsTyping(data.typing);
      }
    });

    socket.on('user_status_updated', (data) => {
      if (data.user_id === recipient.id) {
        setUserStatus(data.status);
      }
    });

    socket.on('message_deleted', (data) => {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== data.message_id));
    });

    socket.on('message_updated', (data) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === data.message_id ? { ...msg, content: data.new_content, edited: true } : msg
        )
      );
    });

    return () => {
      socket.off('typing');
      socket.off('user_status_updated');
      socket.off('message_deleted');
      socket.off('message_updated');
    };
  }, [recipient.id]);

  useEffect(() => {
    if (!user || !recipient) return;
    const room = getRoomName(user.id, recipient.id);
    socket.emit('join', { email: user.email, room });

    socket.on('receive_message', (data) => {
      console.log("Received message:", data); // تحقق من البيانات المستقبلة
      if (
        (data.sender_id === user.id && data.receiver_id === recipient.id) ||
        (data.sender_id === recipient.id && data.receiver_id === user.id)
      ) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
      if (data.receiver_id === user.id) {
        axios.post('http://localhost:5000/read_message', { message_id: data.id });
      }
    });

    setInterval(() => {
      if(user.id){
        fetchMessages(user.id, recipient.id);
      }
    }, 3000);

    return () => {
      socket.emit('leave', { email: user.email, room });
      socket.off('receive_message');
    };
  }, [user, recipient]);

  const fetchMessages = async (sender_id, receiver_id) => {
    const payload = { sender_id, receiver_id };
    try {
      const response = await axios.post('http://localhost:5000/messages', payload);
      setMessages(response.data);
    } catch (error) {
      console.error('حدث خطأ أثناء جلب الرسائل:', error);
    }
  };

  const getRoomName = (user1, user2) => {
    user2 = parseInt(user2);
    user1 = parseInt(user1);
    return `room_${Math.min(user1, user2)}_${Math.max(user1, user2)}`;
  };

  const sendMessage = () => {
    if (!message.trim() && !file) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result.split(',')[1];
        const data = {
          sender_id: user.id,
          receiver_id: recipient.id,
          file_data: fileData,
          file_name: file.name,
          file_type: file.type,
          timestamp: new Date().toISOString()
        };
        socket.emit('send_message', data);
        setMessages((prevMessages) => [...prevMessages, data]); // Update state immediately
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      const data = {
        sender_id: user.id,
        receiver_id: recipient.id,
        content: message,
        timestamp: new Date().toISOString()
      };
      socket.emit('send_message', data);
      setMessages((prevMessages) => [...prevMessages, data]); // Update state immediately
      setMessage('');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleLeaveChat = () => {
    navigate('/chat-list', { state: { user } });
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.post('http://localhost:5000/delete_message', { message_id: messageId, user_id: user.id });
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId)); // Update state immediately
      socket.emit('message_deleted', { message_id: messageId });
    } catch (error) {
      console.error('حدث خطأ أثناء حذف الرسالة:', error);
    }
  };

  const editMessage = async () => {
    try {
      await axios.post('http://localhost:5000/edit_message', {
        message_id: editMessageId,
        new_content: editMessageContent,
        user_id: user.id
      });
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === editMessageId ? { ...msg, content: editMessageContent, edited: true } : msg
        )
      ); // Update state immediately
      socket.emit('message_updated', { message_id: editMessageId, new_content: editMessageContent });
      setEditMessageId(null);
      setEditMessageContent('');
    } catch (error) {
      console.error('حدث خطأ أثناء تحرير الرسالة:', error.response ? error.response.data : error.message);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const filteredMessages = messages.filter(
    (msg) => msg.content && msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
console.log(messages)
  return (
    <div className={`chat-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Chat with {recipient.id}</h1>
      <h3>{userStatus}</h3>
      <button onClick={toggleDarkMode}>{darkMode ? 'Light Mode' : 'Dark Mode'}</button>
      <div className="messages">
  {filteredMessages.map((msg, index) => (
    <div key={index} className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}>
      {msg.content && (
        <div>
          {msg.id === editMessageId ? (
            <div>
              <input
                type="text"
                value={editMessageContent}
                onChange={(e) => setEditMessageContent(e.target.value)}
              />
              <button onClick={editMessage}>Save</button>
            </div>
          ) : (
            <p>{msg.content} <span className="timestamp">{msg.timestamp}</span></p>
          )}
        </div>
      )}
      {msg.file_data && msg.file_type && msg.file_name && (
        <div>
          {msg.file_type.startsWith('image/') ? (
            <div>
              <img src={`data:${msg.file_type};base64,${msg.file_data}`} alt={msg.file_name} />
              <button onClick={() => {
                const link = document.createElement('a');
                link.href = `data:${msg.file_type};base64,${msg.file_data}`;
                link.download = msg.file_name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>Download</button>
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          ) : (
            <div>
              <a href={`data:${msg.file_type};base64,${msg.file_data}`} download={msg.file_name}>
                {msg.file_name}
              </a>
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          )}
        </div>
      )}
      {msg.sender_id === user.id && (
        <div>
          <button onClick={() => deleteMessage(msg.id)}>Delete</button>
          <button onClick={() => { setEditMessageId(msg.id); setEditMessageContent(msg.content); }}>Edit</button>
        </div>
      )}
      {msg.sender_id !== user.id && (
        <button onClick={() => deleteMessage(msg.id)}>Delete for me</button>
      )}
    </div>
  ))}
</div>



      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input type="file" onChange={handleFileChange} />
        <button onClick={sendMessage} disabled={!message.trim() && !file}>Send</button>
        <button onClick={handleLeaveChat}>Leave Chat</button>
      </div>
    </div>
  );
};

export default Chat;
