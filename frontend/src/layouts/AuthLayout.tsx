import React, { ReactNode } from 'react';
import Card from '../components/ui/Card';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
        {/* TODO: Add Logo */}
         <div className="text-center mb-8">
             <h1 className="text-4xl font-bold text-indigo-600 pr-24">FoodyHeaven</h1>
         </div>
      <Card className="w-full max-w-md">
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout;