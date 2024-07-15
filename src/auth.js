import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        return jwtDecode(token);
      } catch (e) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

 
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);

    setAuth(decoded);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth(null);
  };
 
  const handleSendNotification = async (userId , message) => {
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
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };
  return (
    <AuthContext.Provider value={{ auth, login, logout ,handleSendNotification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
