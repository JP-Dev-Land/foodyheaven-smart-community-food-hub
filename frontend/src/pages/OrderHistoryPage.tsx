import React from 'react';
import { useGetMyOrders } from '../services/orderService';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '../utils/formatters';
import { ApiError } from '../types/api';

const OrderHistoryPage: React.FC = () => {
    const { data: orders, isLoading, error, isError } = useGetMyOrders();

    if (isLoading) {
        return <div className="min-h-[300px] flex justify-center items-center"><Spinner size="lg" /></div>;
    }

    if (isError) {
        const errorMessage = (error as ApiError)?.message || 'Could not load your orders.';
        return <div className="container mx-auto p-4 text-center text-red-600">{errorMessage}</div>;
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center text-gray-500">
                You haven't placed any orders yet.
                 <Link to="/food" className="text-indigo-600 hover:underline ml-2">Browse Menu</Link>
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
         <div className="space-y-6">
             {orders.map(order => (
                 <div key={order.id} className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-3 border-b">
                        <div>
                            <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-700">{order.id}</span></p>
                            <p className="text-sm text-gray-500">Placed on: <span className="font-medium text-gray-700">{formatDate(order.createdAt)}</span></p>
                        </div>
                        <div>
                             <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                 order.status.includes('DELIVERED') ? 'bg-green-100 text-green-800' :
                                 order.status.includes('CANCELLED') ? 'bg-red-100 text-red-800' :
                                 order.status.includes('DELIVERY') ? 'bg-blue-100 text-blue-800' :
                                 'bg-yellow-100 text-yellow-800'
                             }`}>
                                {order.status.replace(/_/g, ' ').toLowerCase()}
                             </span>
                         </div>
                         <div className="text-sm font-semibold text-gray-800">
                              Total: {formatPrice(Number(order.totalAmount))}
                         </div>
                    </div>
                     <div className="mb-3">
                         <h4 className="text-xs font-medium text-gray-600 mb-1">Items:</h4>
                         <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                             {order.items.map(item => (
                                 <li key={item.id}>
                                     {item.quantity} x {item.foodItemName} ({formatPrice(Number(item.priceAtOrderTime))} each)
                                 </li>
                             ))}
                         </ul>
                     </div>
                     <div className="text-right">
                         <Link to={`/orders/${order.id}`} className="text-sm text-indigo-600 hover:underline">
                            View Details
                         </Link>
                     </div>
                 </div>
             ))}
         </div>
    </div>
  );
};

export default OrderHistoryPage;