import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import FoodListPage from '../pages/FoodListPage';
import FoodDetailPage from '../pages/FoodDetailPage';
import CreateFoodItemPage from '../pages/CreateFoodItemPage';
import EditFoodItemPage from '../pages/EditFoodItemPage';

import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="text-indigo-600" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />}
      />
      <Route path="/food" element={<FoodListPage />} />
      <Route path="/food/:id" element={<FoodDetailPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/food/new" element={<CreateFoodItemPage />} />
        <Route path="/food/:id/edit" element={<EditFoodItemPage />} />
      </Route>

      {/* Catch-all Route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRouter;
