import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import FoodListPage from '../pages/FoodListPage';
import FoodDetailPage from '../pages/FoodDetailPage';
import CreateFoodItemPage from '../pages/CreateFoodItemPage';
import EditFoodItemPage from '../pages/EditFoodItemPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import ProfilePage from '../pages/ProfilePage';
import AdminUserListPage from '../pages/AdminUserListPage';
import AdminUserEditPage from '../pages/AdminUserEditPage';
import AdminRoute from './AdminRoute';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import CookDashboardPage from '../pages/CookDashboardPage';
import DeliveryDashboardPage from '../pages/DeliveryDashboardPage';
import CookRoute from './CookRoute';
import DeliveryAgentRoute from './DeliveryAgentRoute';
import AdminCreateUserPage from '../pages/AdminCreateUserPage';
import MainLayout from './MainLayout';
import OrderDetailPage from '../pages/OrderDetailPage';

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

      {/* Routes within MainLayout (Header/Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/food" element={<FoodListPage />} />
        <Route path="/food/:id" element={<FoodDetailPage />} />
        <Route path='/cart' element={<CartPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/food/new" element={<CreateFoodItemPage />} />
          <Route path="/food/:id/edit" element={<EditFoodItemPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/order-details/:id" element={<OrderDetailPage />} />
          {/* <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} /> */}

          {/* Cook Routes */}
          <Route path="/cook" element={<CookRoute />}>
            <Route path="dashboard" element={<CookDashboardPage />} />
            {/* Add other cook routes */}
          </Route>

          {/* Delivery Agent Routes */}
          <Route path="/delivery" element={<DeliveryAgentRoute />}>
            <Route path="dashboard" element={<DeliveryDashboardPage />} />
            {/* Add other delivery routes */}
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboardPage />} /> {/* Default admin page */}
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUserListPage />} />
            <Route path="users/new" element={<AdminCreateUserPage />} /> {/* Added Create User Route */}
            <Route path="users/:id/edit" element={<AdminUserEditPage />} />
            {/* Add other admin routes */}
          </Route>
        </Route>
      </Route> {/* End of MainLayout routes */}

      {/* Catch-all Route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRouter;
