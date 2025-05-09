import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * @param {{
 *   children: React.ReactNode,
 *   requiredRoles?: string[],
 *   redirectPath?: string,
 *   fallbackComponent?: React.ReactNode
 * }} props
 */
export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  redirectPath = '/login',
  fallbackComponent = null 
}) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!currentUser) {
    // Save the attempted URL for redirecting back after login
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If no roles are required, allow access
  if (requiredRoles.length === 0) {
    return children;
  }

  // Get user role from custom claims or user data
  const userRole = currentUser.role || 'user';

  // Check if user has required role
  if (!requiredRoles.includes(userRole)) {
    // Show fallback component or redirect to home
    return fallbackComponent || <Navigate to="/" replace />;
  }

  // User is authenticated and has required role
  return children;
} 