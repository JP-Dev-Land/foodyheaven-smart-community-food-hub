import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
    const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to FoodyHeaven!</h1>
       {user ? (
            <p className="mb-4">You are logged in as: {user.name} ({user.username})</p>
       ) : (
            <p className="mb-4">You are logged in.</p> // Fallback if user data isn't loaded yet
       )}
        {/* TODO: implement actual dashboard */}
       <p>This is your dashboard. More features coming soon!</p>

       <Button variant="secondary" onClick={logout} className="mt-6">
            Logout
       </Button>
    </div>
  );
};

export default HomePage;