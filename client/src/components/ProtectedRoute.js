import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  
  return token ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
