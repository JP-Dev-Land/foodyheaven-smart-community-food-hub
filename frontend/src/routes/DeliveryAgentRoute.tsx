import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

const DeliveryAgentRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

   if (isLoading) {
       return <div><Spinner size="sm" className="mr-2" />Loading...</div>;
   }

  const isDeliveryAgent = user?.roles?.includes('ROLE_DELIVERY_AGENT') ?? false;

  if (!isAuthenticated || !isDeliveryAgent) {
    console.warn("Access denied: User does not have DELIVERY_AGENT role.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default DeliveryAgentRoute;