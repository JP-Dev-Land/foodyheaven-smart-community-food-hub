import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

const CookRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
       return <div><Spinner size="sm" className="mr-2" />Loading...</div>;
  }

  const isCook = user?.roles?.includes('ROLE_COOK') ?? false;

  if (!isAuthenticated || !isCook) {
    console.warn("Access denied: User does not have COOK role.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default CookRoute;