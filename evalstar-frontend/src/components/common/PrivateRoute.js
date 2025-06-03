// src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';

const PrivateRoute = ({ children, userType }) => {
  const { user, userType: authUserType, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if the user has the correct role
  if (userType && authUserType !== userType) {
    // Redirect to the appropriate dashboard based on user type
    let redirectPath = '/login';
    
    switch (authUserType) {
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      case 'teacher':
        redirectPath = '/teacher/dashboard';
        break;
      case 'student':
        redirectPath = '/student/dashboard';
        break;
      default:
        redirectPath = '/login';
    }
    
    return <Navigate to={redirectPath} />;
  }

  return <Layout>{children}</Layout>;
};

export default PrivateRoute;
