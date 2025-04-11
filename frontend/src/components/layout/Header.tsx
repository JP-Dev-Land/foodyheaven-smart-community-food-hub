import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CartIcon from '../cart/CartIcon';

import { UserCircleIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, BuildingStorefrontIcon, TruckIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
    const { isAuthenticated, user, logout, isLoading } = useAuth();

    // checks for roles
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
    const isCook = user?.roles?.includes('ROLE_COOK') ?? false;
    const isDeliveryAgent = user?.roles?.includes('ROLE_DELIVERY_AGENT') ?? false;

    // for active NavLink styling
    const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
        return isActive
         ? "text-indigo-600 font-medium border-b-2 border-indigo-500 px-1 py-2 text-sm"
         : "text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-300 px-1 py-2 text-sm font-medium";
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-indigo-600">
                            Foody<span className="text-orange-500">Heaven</span>
                        </Link>
                    </div>

                    {/* Main Navigation - Centered */}
                     <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                         <NavLink to="/food" className={getNavLinkClass}>
                             <BuildingStorefrontIcon className="h-4 w-4 mr-1 inline-block" /> Menu
                         </NavLink>

                         {/* Conditional Links based on Roles */}
                         {isAdmin && (
                             <NavLink to="/admin/users" className={getNavLinkClass}>
                                <Cog6ToothIcon className="h-4 w-4 mr-1 inline-block" /> Admin Panel
                             </NavLink>
                         )}
                         {isCook && (
                             <NavLink to="/cook/dashboard" className={getNavLinkClass}> {/* Placeholder Route */}
                                <Square3Stack3DIcon className="h-4 w-4 mr-1 inline-block" /> Cook Dashboard
                             </NavLink>
                         )}
                         {isDeliveryAgent && (
                             <NavLink to="/delivery/dashboard" className={getNavLinkClass}> {/* Placeholder Route */}
                                 <TruckIcon className="h-4 w-4 mr-1 inline-block" /> Delivery Dashboard
                             </NavLink>
                         )}
                         {isAuthenticated && !isCook && !isDeliveryAgent && !isAdmin && (
                            <NavLink to="/order-history" className={getNavLinkClass}> {/* Placeholder Route */}
                                My Orders
                            </NavLink>
                         )}
                     </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {!isLoading && isAuthenticated ? ( // Show only when not loading and authenticated
                            <>
                                <CartIcon />
                                <NavLink to="/profile" className={getNavLinkClass} title="Profile">
                                    <UserCircleIcon className="h-5 w-5 inline-block" />
                                    <span className="sr-only sm:inline sm:ml-1">{user?.name?.split(' ')[0]}</span> {/* Show first name */}
                                </NavLink>
                                <button
                                    onClick={logout}
                                    title="Logout"
                                    className="p-1 rounded-full text-gray-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                                    <span className="sr-only">Logout</span>
                                </button>
                            </>
                        ) : !isLoading && !isAuthenticated ? (
                            <>
                                <NavLink to="/login" className={getNavLinkClass} title="Login">
                                   <ArrowRightOnRectangleIcon className="h-5 w-5 inline-block" />
                                   <span className="hidden sm:inline sm:ml-1">Login</span>
                                </NavLink>
                                {/* Optional: Register button
                                <Link to="/register" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Register
                                </Link>
                                */}
                            </>
                        ) : (
                           // Show minimal loader or nothing while loading initial auth state
                           <div className="h-6 w-6 animate-pulse bg-gray-200 rounded-full"></div>
                        )}
                    </div>
               </div>
            </nav>
        </header>
    );
};

export default Header;