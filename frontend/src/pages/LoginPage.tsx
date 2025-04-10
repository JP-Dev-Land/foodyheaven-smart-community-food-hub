import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import AuthLayout from '../layouts/AuthLayout';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;