import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ element, requiredRole }) => {
  const { user } = useAuth();

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a requiredRole is specified and the user doesn't have the right role, redirect to Home or another page
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />; // Redirect to home or any other page you prefer
  }

  // If user is authenticated and has the required role, render the requested page
  return element;
};

export default ProtectedRoute;
