import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types/api';

// Helper function to check for Admin role
const hasAdminRole = (user: UserProfile | null): boolean => {
     return user?.roles?.includes('ROLE_ADMIN') ?? false;
};


const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth(); // Assuming useAuth provides user object

   if (isLoading) {
       return <div>Checking admin permissions...</div>; // Or a Spinner
   }

  if (!isAuthenticated || !hasAdminRole(user)) {
    // TODO: toast for warning
    console.warn("Access denied: User does not have ADMIN role.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;