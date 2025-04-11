import React from 'react';
import { useGetAdminDashboardAnalytics } from '../services/analyticsService';
import { ApiError } from '../types/api';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import { formatPrice } from '../utils/formatters'; // Assuming formatter exists
import { ChartBarIcon, CurrencyDollarIcon, UsersIcon, ShoppingBagIcon, UserGroupIcon, CubeIcon } from '@heroicons/react/24/outline'; // Example icons

const AdminDashboardPage: React.FC = () => {
    const { data: analytics, isLoading, error, isError } = useGetAdminDashboardAnalytics();

    if (isLoading) {
        return <div className="container mx-auto p-4"><Spinner /> Loading Analytics...</div>;
    }

    if (isError) {
        const errorMessage = (error as ApiError)?.message || 'Could not load dashboard analytics.';
        return <div className="container mx-auto p-4 text-center text-red-600">{errorMessage}</div>;
    }

    if (!analytics) {
        return <div className="container mx-auto p-4 text-center text-gray-500">No analytics data available.</div>;
    }

    // Helper to render key stats
    const renderStatCard = (title: string, value: string | number, icon: React.ReactNode) => (
        <Card className="flex items-center p-4">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </Card>
    );

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {renderStatCard("Total Revenue", formatPrice(analytics.totalRevenue), <CurrencyDollarIcon className="h-6 w-6" />)}
                {renderStatCard("Total Orders", analytics.totalOrders, <ShoppingBagIcon className="h-6 w-6" />)}
                {renderStatCard("Total Users", analytics.totalUsers, <UsersIcon className="h-6 w-6" />)}
                {renderStatCard("Total Cooks", analytics.totalCooks, <UserGroupIcon className="h-6 w-6" />)}
                {renderStatCard("Delivery Agents", analytics.totalDeliveryAgents, <CubeIcon className="h-6 w-6" />)}
                {/* Add more stats as needed */}
            </div>

            {/* Order Status Distribution */}
            <Card>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Order Status Distribution
                </h2>
                <div className="space-y-2">
                    {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 capitalize">{status.replace(/_/g, ' ').toLowerCase()}</span>
                            <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{count}</span>
                        </div>
                    ))}
                    {Object.keys(analytics.ordersByStatus).length === 0 && (
                         <p className="text-sm text-gray-500">No order status data available.</p>
                    )}
                </div>
            </Card>

            {/* User Role Distribution */}
            <Card>
                 <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-gray-500" />
                    User Role Distribution
                 </h2>
                 <div className="space-y-2">
                    {Object.entries(analytics.usersByRole).map(([role, count]) => (
                        <div key={role} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{role.replace('ROLE_', '')}</span>
                            <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{count}</span>
                        </div>
                    ))}
                     {Object.keys(analytics.usersByRole).length === 0 && (
                         <p className="text-sm text-gray-500">No user role data available.</p>
                    )}
                 </div>
            </Card>

            {/* TODO: Add links/buttons to other admin sections like User Management */}
            {/* <div className="mt-6">
                <Link to="/admin/users">
                    <Button variant="secondary">Manage Users</Button>
                </Link>
            </div> */}

        </div>
    );
};

export default AdminDashboardPage;