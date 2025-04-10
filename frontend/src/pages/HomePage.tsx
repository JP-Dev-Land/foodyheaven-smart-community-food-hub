import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const canCreate = isAuthenticated;

  if (!user) {
    return (
      <div className="container mx-auto p-4 py-12 text-center">
        <p>Loading user information...</p>
        <Button variant="secondary" onClick={logout} className="mt-6">
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Welcome back, {user.name}!
          </h1>
          <p className="text-sm text-gray-600">Logged in as: {user.username}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Menu Card */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Explore the Menu</h2>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Browse all the delicious food items currently available for order.
            </p>
            <Link to="/food" className="mt-auto">
              <Button variant="secondary" className="w-full justify-center">
                View Menu
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Add Item Card */}
        {canCreate && (
          <Card className="hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Add Your Creations</h2>
              <p className="text-sm text-gray-600 mb-4 flex-grow">
                Add a new dish or item to the FoodyHeaven menu.
              </p>
              <Link to="/food/new" className="mt-auto">
                <Button variant="primary" className="w-full justify-center">
                  Add New Item
                  <PlusIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Profile Placeholder */}
        <Card className="hover:shadow-md transition-shadow duration-200 opacity-60 cursor-not-allowed">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Profile</h2>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              Manage your account details and settings (coming soon).
            </p>
            <Button variant="secondary" className="w-full mt-auto" disabled>
              Go to Profile
            </Button>
          </div>
        </Card>

        {/* Orders Placeholder */}
        <Card className="hover:shadow-md transition-shadow duration-200 opacity-60 cursor-not-allowed">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Order History</h2>
            <p className="text-sm text-gray-600 mb-4 flex-grow">
              View your past orders and track current ones (coming soon).
            </p>
            <Button variant="secondary" className="w-full mt-auto" disabled>
              View Orders
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
