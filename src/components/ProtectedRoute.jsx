import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute component that handles authentication and role-based access control
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authenticated
 * @param {string} [props.requiredRole] - The role required to access the route
 * @param {string[]} [props.allowedRoles] - Array of roles allowed to access the route
 * @param {string} [props.redirectPath="/"] - Where to redirect if not authenticated
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  allowedRoles,
  redirectPath = "/",
}) => {
  const { currentUser, loading, userRole } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  // If no role requirements, allow access
  if (!requiredRole && !allowedRoles) {
    return children;
  }

  // Check if user has the required role
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute; 