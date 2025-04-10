import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner'; // Use spinner while checking auth state

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Showing a loading indicator while checking auth status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="text-indigo-600"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the child route component if authenticated
  return <Outlet />;
};

export default ProtectedRoute;