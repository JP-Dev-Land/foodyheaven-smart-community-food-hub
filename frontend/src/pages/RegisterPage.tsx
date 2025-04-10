import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import AuthLayout from '../layouts/AuthLayout';

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout>
      <RegisterForm />
       <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Login here
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;