import React, { useState, useEffect, useReducer, useCallback } from 'react';
import io from 'socket.io-client';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Chat.css';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const socket = io('http://localhost:5000');

const initialState = {
  message: '',
  file: null,
  messages: [],
  editMessageId: null,
  editMessageContent: '',
  userStatus: '',
  isTyping: false,
  darkMode: false,
  searchTerm: '',
  user: {}
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
        )
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };
    case 'SET_EDIT_MESSAGE':
      return {
        ...state,
        editMessageId: action.payload.id,
        editMessageContent: action.payload.content
      };
    case 'SET_USER_STATUS':
      return { ...state, userStatus: action.payload };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    case 'SET_FILE':
      return { ...state, file: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    default:
      return state;
  }
};

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recipient = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    dispatch({ type: 'SET_USER', payload: decoded.sub });
  }, []);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user_status/${recipient.id}`);
        const data = response.data;
        dispatch({ type: 'SET_USER_STATUS', payload: data.status });
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
        await axios.post('http://localhost:5000/update_last_seen', { user_id: state.user.id });
      } catch (error) {
        console.error('حدث خطأ أثناء تحديث آخر ظهور:', error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [state.user.id]);

  useEffect(() => {
    socket.on('typing', (data) => {
      if (data.sender_id === recipient.id) {
        dispatch({ type: 'SET_TYPING', payload: data.typing });
      }
    });

    return () => {
      socket.off('typing');
    };
  }, [recipient.id]);

  const handleTyping = (e) => {
    dispatch({ type: 'SET_MESSAGE', payload: e.target.value });
    socket.emit('typing', { sender_id: state.user.id, receiver_id: recipient.id, typing: e.target.value.length > 0 });
  };

  useEffect(() => {
    if (!state.user || !recipient) return;
    const room = getRoomName(state.user.id, recipient.id);
    socket.emit('join', { email: state.user.email, room });

    socket.on('receive_message', (data) => {
      if (
        (data.sender_id === state.user.id && data.receiver_id === recipient.id) ||
        (data.sender_id === recipient.id && data.receiver_id === state.user.id)
      ) {
        dispatch({ type: 'ADD_MESSAGE', payload: data });
      }
    });

    socket.on('message_deleted', (data) => {
      dispatch({ type: 'DELETE_MESSAGE', payload: data.message_id });
    });

    socket.on('message_updated', (data) => {
      dispatch({ type: 'UPDATE_MESSAGE', payload: { id: data.message_id, content: data.new_content, edited: true } });
    });

    fetchMessages(state.user.id, recipient.id);

    return () => {
      socket.emit('leave', { email: state.user.email, room });
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('message_updated');
    };
  }, [state.user, recipient]);

  const fetchMessages = async (sender_id, receiver_id) => {
    const payload = { sender_id, receiver_id };
    try {
      const response = await axios.post('http://localhost:5000/messages', payload);
      dispatch({ type: 'SET_MESSAGES', payload: response.data });
    } catch (error) {
      console.error('حدث خطأ أثناء جلب الرسائل:', error);
    }
  };

  const getRoomName = (user1, user2) => {
    user2 = parseInt(user2);
    return `room_${Math.min(user1, user2)}_${Math.max(user1, user2)}`;
  };

  const sendMessage = () => {
    if (state.file) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result.split(',')[1];
        const data = {
          sender_id: state.user.id,
          receiver_id: recipient.id,
          file_data: fileData,
          file_name: state.file.name,
          file_type: state.file.type
        };
        socket.emit('send_message', data);
        dispatch({ type: 'SET_FILE', payload: null });
      };
      reader.readAsDataURL(state.file);
    } else {
      const data = {
        sender_id: state.user.id,
        receiver_id: recipient.id,
        content: state.message
      };
      socket.emit('send_message', data);
      dispatch({ type: 'ADD_MESSAGE', payload: data });
      dispatch({ type: 'SET_MESSAGE', payload: '' });
    }
  };

  const handleFileChange = (event) => {
    dispatch({ type: 'SET_FILE', payload: event.target.files[0] });
  };

  const handleLeaveChat = () => {
    navigate('/doctors', { state: { user: state.user } });
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.post('http://localhost:5000/delete_message', { message_id: messageId, user_id: state.user.id });
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
    } catch (error) {
      console.error('حدث خطأ أثناء حذف الرسالة:', error);
    }
  };

  const editMessage = async () => {
    try {
      await axios.post('http://localhost:5000/edit_message', {
        message_id: state.editMessageId,
        new_content: state.editMessageContent,
        user_id: state.user.id
      });
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: state.editMessageId, content: state.editMessageContent, edited: true }
      });
      dispatch({ type: 'SET_EDIT_MESSAGE', payload: { id: null, content: '' } });
    } catch (error) {
      console.error('حدث خطأ أثناء تحرير الرسالة:', error.response ? error.response.data : error.message);
    }
  };

  const filteredMessages = state.messages.filter(
    (msg) => msg.content && msg.content.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <h1>Chat with {recipient.id}</h1>
      <h3>{state.userStatus}</h3>
      <div className="messages">
        {filteredMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender_id === state.user.id ? 'sent' : 'received'}`}>
            {msg.content && (
              <div>
                {msg.id === state.editMessageId ? (
                  <div>
                    <input
                      type="text"
                      value={state.editMessageContent}
                      onChange={(e) => dispatch({ type: 'SET_EDIT_MESSAGE', payload: { ...state, editMessageContent: e.target.value } })}
                    />
                    <button onClick={editMessage}>Save</button>
                  </div>
                ) : (
                  <p>{msg.content} <span className="timestamp">{msg.timestamp}</span></p>
                )}
              </div>
            )}
            {msg.file_data && msg.file_type.startsWith('image/') && (
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
            )}
            {msg.file_data && !msg.file_type.startsWith('image/') && (
              <div>
                <a href={`data:${msg.file_type};base64,${msg.file_data}`} download={msg.file_name}>
                  {msg.file_name}
                </a>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            )}
            {msg.sender_id === state.user.id && (
              <div>
                <button onClick={() => deleteMessage(msg.id)}>Delete</button>
                <button onClick={() => dispatch({ type: 'SET_EDIT_MESSAGE', payload: { id: msg.id, content: msg.content } })}>Edit</button>
              </div>
            )}
            {msg.sender_id !== state.user.id && (
              <button onClick={() => deleteMessage(msg.id)}>Delete for me</button>
            )}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={state.message}
          onChange={handleTyping}
        />
        <input type="file" onChange={handleFileChange} />
        <button onClick={sendMessage}>Send</button>
        <button onClick={handleLeaveChat}>Leave Chat</button>
      </div>
    </div>
  );
};

export default Chat;
