import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('slms_token');
    if (!savedToken) return null;
    try {
      const payload = JSON.parse(atob(savedToken.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('slms_token');
        localStorage.removeItem('slms_user');
        return null;
      }
    } catch (e) {
      localStorage.removeItem('slms_token');
      localStorage.removeItem('slms_user');
      return null;
    }
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    if (!token) return null;
    const savedUser = localStorage.getItem('slms_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('slms_user', JSON.stringify(userData));
        localStorage.setItem('slms_token', userToken);
        setLoading(false);
        return { success: true, user: userData };
      }
      setLoading(false);
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('slms_user');
    localStorage.removeItem('slms_token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
