// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('evalstar_user');
    const storedUserType = localStorage.getItem('evalstar_user_type');
    
    if (storedUser && storedUserType) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
    
    setLoading(false);
  }, []);

  const login = async (userType, identifier, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(userType, identifier, password);
      
      const userData = response.data.user;
      const token = response.data.access_token;
      const type = response.data.user_type;
      
      // Store user data in local storage
      localStorage.setItem('evalstar_token', token);
      localStorage.setItem('evalstar_user', JSON.stringify(userData));
      localStorage.setItem('evalstar_user_type', type);
      
      setUser(userData);
      setUserType(type);
      setError(null);
      
      // Redirect based on user type
      switch (type) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
      
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all stored data
      localStorage.removeItem('evalstar_token');
      localStorage.removeItem('evalstar_user');
      localStorage.removeItem('evalstar_user_type');
      
      setUser(null);
      setUserType(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
        