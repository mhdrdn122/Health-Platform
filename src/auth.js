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
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [verified , setverified ] = useState(false);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const decoded = jwtDecode(accessToken);
    setAuth(decoded);
    setverified(decoded.is_verified);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAuth(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('http://localhost:5000/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('token', newAccessToken);
      const decoded = jwtDecode(newAccessToken);
      setAuth(decoded);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      logout();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (auth) {
        refreshAccessToken();
      }
    }, 15 * 60 * 1000); // تجديد التوكن كل 15 دقيقة
    return () => clearInterval(interval);
  }, [auth]);

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
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout ,handleSendNotification ,verified }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
