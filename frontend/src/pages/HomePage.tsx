import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const HomePage: React.FC = () => {
    const { user } = useAuth();

    // Role checks
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
    const isCook = user?.roles?.includes('ROLE_COOK') ?? false;
    const isDeliveryAgent = user?.roles?.includes('ROLE_DELIVERY_AGENT') ?? false;
    const isRegularUser = !isAdmin && !isCook && !isDeliveryAgent; // Assuming base role is USER

    const renderRoleSpecificContent = () => {
        if (isAdmin) {
            return (
                <div className="space-y-4">
                    <p className="text-lg text-gray-700">Manage the platform efficiently.</p>
                    <Link to="/admin/users">
                        <Button variant="primary" size="lg">
                            Manage Users <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </Button>
                    </Link>
                    {/* TODO: Add links to other admin sections */}
                </div>
            );
        }
        if (isCook) {
            return (
                <div className="space-y-4">
                    <p className="text-lg text-gray-700">Manage your menu and incoming orders.</p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/food/new">
                            <Button variant="secondary" size="lg">Add New Item</Button>
                        </Link>
                        <Link to="/cook/dashboard"> {/* Placeholder */}
                            <Button variant="primary" size="lg">
                                View Orders <ArrowRightIcon className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>
                         {/* TODO: Add link to manage existing items */}
                    </div>
                </div>
            );
        }
        if (isDeliveryAgent) {
            return (
                <div className="space-y-4">
                    <p className="text-lg text-gray-700">Find available deliveries and manage your routes.</p>
                    <Link to="/delivery/dashboard">
                        <Button variant="primary" size="lg">
                            View Available Deliveries <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            );
        }
        if (isRegularUser) {
             return (
                <div className="space-y-4">
                    <p className="text-lg text-gray-700">Ready for your next delicious meal?</p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/food">
                            <Button variant="primary" size="lg">
                                Browse Full Menu <ArrowRightIcon className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>
                         <Link to="/order-history">
                            <Button variant="secondary" size="lg">View My Orders</Button>
                        </Link>
                    </div>
                </div>
            );
        }
        // Fallback (shouldn't happen if roles are assigned)
        return <p className="text-gray-600">Loading your dashboard...</p>;
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Welcome back, <span className="text-indigo-600">{user?.name ?? 'Guest'}</span>!
                </h1>
                <div className="mt-8">
                    {renderRoleSpecificContent()}
                </div>

                <div className="mt-16 pt-10 border-t border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Links</h2>
                    <div className="flex justify-center gap-6">
                         <Link to="/profile" className="text-indigo-600 hover:underline">My Profile</Link>
                         <Link to="/food" className="text-indigo-600 hover:underline">Full Menu</Link>
                         {/* TODO: Add other relevant links */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;