import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if user has token
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    console.log('🔐 No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Token valid, allowing access');
  return children;
}