import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth'; // Needed for conditional public routes
import Spinner from '../components/ui/Spinner';

const AppRouter: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth(); // Get auth state

    // Prevent flicker on initial load for public routes too
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg"/></div>;
    }

  return (
      <Routes>
        {/* Public Routes - Redirect if logged in */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
            {/* all authenticated routes here */}
            <Route path="/" element={<HomePage />} />
            {/* Example: <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>

        {/* Catch-all or Not Found Route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
  );
};

export default AppRouter;