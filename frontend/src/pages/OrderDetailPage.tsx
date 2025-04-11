import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { useGetOrderById } from '../services/orderService';
import { useWebSocket } from '../contexts/WebSocketProvider'; // Use the WebSocket hook/context
import { OrderDTO, ApiError } from '../types/api';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate } from '../utils/formatters'; // Assuming formatters exist
import Card from '../components/ui/Card'; // Import Card
import OrderStatusBadge from '../components/order/OrderStatusBadge'; // Assuming this component exists
import OrderTracker from '../components/order/OrderTracker'; // Import OrderTracker

// Re-define or import query keys if needed
const orderKeys = {
    detail: (id: number | string | undefined) => ['orders', 'detail', id] as const,
};

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient(); // Get query client instance
    const { isConnected, subscribe, unsubscribe } = useWebSocket(); // Get WebSocket functions

    // Fetch initial order data
    const { data: order, isLoading, error, isError } = useGetOrderById(id);

    // Effect to handle WebSocket subscription
    useEffect(() => {
        // Ensure we have an ID and the WebSocket is connected
        if (!id || !isConnected) {
             console.log(`OrderDetailPage: WebSocket not connected or no ID (${id}), skipping subscription.`);
             return;
        }

        // Define the destination topic for this specific order's status updates
        const destination = `/topic/orders/${id}/status`;

        console.log(`OrderDetailPage: Subscribing to ${destination}`);
        // Subscribe and store the identifier returned by the hook
        const subscriptionId = subscribe(destination, (message) => {
            try {
                // Parse the incoming message body (expected to be an OrderDTO)
                const updatedOrder: OrderDTO = JSON.parse(message.body);
                console.log(`OrderDetailPage: Received status update for order ${id}:`, updatedOrder);

                // Update the React Query cache with the new data
                // This will cause components using useGetOrderById to re-render
                queryClient.setQueryData(orderKeys.detail(id), updatedOrder);
            } catch (e) {
                console.error("Failed to parse order update message:", e);
            }
        });

        // Cleanup function: Unsubscribe when the component unmounts or dependencies change
        return () => {
            if (subscriptionId) {
                console.log(`OrderDetailPage: Unsubscribing from ${destination}`);
                unsubscribe(subscriptionId);
            }
        };
        // Dependencies: Re-run effect if id, connection status, or hook functions change
    }, [id, isConnected, subscribe, unsubscribe, queryClient]);

    // --- Render Logic ---

    if (isLoading) {
        return <div className="min-h-[300px] flex justify-center items-center"><Spinner size="lg" /></div>;
    }

    if (isError || !order) {
         const errorMessage = (error as ApiError)?.message || 'Order not found or could not be loaded.';
        return (
           <div className="container mx-auto p-4 text-center text-red-600">
              <p>{errorMessage}</p>
              <Link to="/order-history" className="text-indigo-600 hover:underline mt-2 inline-block">
                  ← Back to My Orders
              </Link>
            </div>
        );
    }

    // Display order details - this part re-renders automatically when cache updates
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
             <Link to="/order-history" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
                ← Back to My Orders
             </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Order Details #{order.id}</h1>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
                    <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium text-gray-800">{order.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Placed On</p>
                        <p className="font-medium text-gray-800">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium text-gray-800">{formatPrice(Number(order.totalAmount))}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <OrderStatusBadge status={order.status} />
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Cook</p>
                        <p className="font-medium text-gray-800">{order.cookName || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Delivery Agent</p>
                        <p className="font-medium text-gray-800">{order.deliveryAgentName || 'Not Assigned Yet'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pickup Location</p>
                        <p className="font-medium text-gray-800">
                            Lat: {order.pickupLocation?.latitude ?? 'N/A'}, Lng: {order.pickupLocation?.longitude ?? 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Delivery Location</p>
                        <p className="font-medium text-gray-800">
                            Lat: {order.deliveryLocation?.latitude ?? 'N/A'}, Lng: {order.deliveryLocation?.longitude ?? 'N/A'}
                        </p>
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-4">Items Ordered</h2>
                <div className="space-y-4">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
                            <img
                                src={item.foodItemImageUrl || '/placeholder.jpg'}
                                alt={item.foodItemName}
                                className="w-16 h-16 object-cover rounded flex-shrink-0"
                                onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                            />
                            <div className="flex-grow">
                                <p className="font-medium text-gray-800">{item.foodItemName}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm text-gray-600">{formatPrice(Number(item.priceAtOrderTime))} each</p>
                                <p className="font-medium text-gray-800">
                                    {formatPrice(Number(item.priceAtOrderTime) * item.quantity)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Track Delivery</h2>
                    <OrderTracker orderId={parseInt(id!, 10)} />
                </div>
            </Card>
        </div>
    );
};

export default OrderDetailPage;