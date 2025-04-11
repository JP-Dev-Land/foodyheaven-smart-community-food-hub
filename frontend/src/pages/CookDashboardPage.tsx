import React, { useEffect, useMemo, useRef } from 'react'; // Import useRef
import { useQueryClient } from '@tanstack/react-query';
import { useGetCookOrders, useUpdateOrderStatus } from '../services/orderService';
import { useWebSocket } from '../contexts/WebSocketProvider';
import { useAuth } from '../hooks/useAuth';
import { OrderDTO, ApiError, OrderStatus, UpdateOrderStatusRequestDTO } from '../types/api';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import { formatPrice, formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

const orderKeys = {
    list: (type: string, id?: string | number) => ['orders', 'list', { type, id }] as const,
    detail: (id: number | string | undefined) => ['orders', 'detail', id] as const,
};

const CookDashboardPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { isConnected, subscribe, unsubscribe } = useWebSocket();

    const { data: orders, isLoading, error, isError, refetch } = useGetCookOrders();
    const { mutate: updateStatus, isPending: isUpdatingStatus, variables: updatingVariables } = useUpdateOrderStatus();

    // Use a ref to track active subscriptions (Map: orderId -> subscriptionId)
    const activeSubscriptions = useRef<Map<number, string>>(new Map());

    // Refined WebSocket subscription effect
    useEffect(() => {
        // Ensure we are connected and have user context
        if (!isConnected || !user) {
            // If not connected, ensure all existing subscriptions are cleaned up
            if (activeSubscriptions.current.size > 0) {
                console.log("CookDashboard Cleanup: Not connected/no user, unsubscribing all.");
                activeSubscriptions.current.forEach((subId, orderId) => {
                     console.log(`   - Unsubscribing order ${orderId}`);
                     unsubscribe(subId);
                });
                activeSubscriptions.current.clear();
            }
            return; // Exit if not connected or no user
        }

        // Wait for orders data to be available
        if (!orders) {
            return;
        }

        console.log("CookDashboard Subscription Effect: Syncing subscriptions...");
        const currentOrderIds = new Set(orders.map(o => o.id));
        const subscribedIds = new Set(activeSubscriptions.current.keys());

        // 1. Unsubscribe from orders that are no longer in the current list
        subscribedIds.forEach(orderId => {
            if (!currentOrderIds.has(orderId)) {
                const subId = activeSubscriptions.current.get(orderId);
                if (subId) {
                    console.log(`CookDashboard: Unsubscribing from removed/completed order ${orderId}`);
                    unsubscribe(subId);
                    activeSubscriptions.current.delete(orderId); // Remove from tracking
                }
            }
        });

        // 2. Subscribe to new orders that are not already subscribed
        currentOrderIds.forEach(orderId => {
            if (!subscribedIds.has(orderId)) {
                const destination = `/topic/orders/${orderId}/status`;
                console.log(`CookDashboard: Subscribing to new/updated order ${orderId} at ${destination}`);
                const subId = subscribe(destination, (message) => {
                    try {
                        const updatedOrder: OrderDTO = JSON.parse(message.body);
                        console.log(`CookDashboard: Received WS update for order ${orderId}:`, updatedOrder);
                        // Update caches using the received data
                        queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
                        queryClient.setQueryData(
                            orderKeys.list('cook'), // Ensure this key matches useGetCookOrders
                            (oldData: OrderDTO[] | undefined) => {
                                if (!oldData) return [updatedOrder];
                                // Replace or add the updated order
                                const exists = oldData.some(o => o.id === updatedOrder.id);
                                return exists
                                    ? oldData.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                                    : [...oldData, updatedOrder]; // Add if somehow missing
                            }
                        );
                    } catch (e) {
                        console.error(`Failed to parse order update message for order ${orderId}:`, e);
                    }
                });
                if (subId) {
                    // Store the new subscription ID, keyed by order ID
                    activeSubscriptions.current.set(orderId, subId);
                } else {
                     console.warn(`CookDashboard: Failed to get subscription ID for order ${orderId}`);
                }
            }
        });

        // This effect's cleanup function (runs only on unmount or when isConnected/user changes)
        return () => {
            // Unsubscribe from all tracked subscriptions when the component unmounts
            // or connection/user changes requires a full reset.
            console.log("CookDashboard Effect Cleanup: Unsubscribing all active subscriptions on unmount/dep change.");
            activeSubscriptions.current.forEach((subId, orderId) => {
                 console.log(`   - Unsubscribing order ${orderId}`);
                 unsubscribe(subId);
            });
            activeSubscriptions.current.clear(); // Clear the tracking map
        };
        // Dependencies: Re-run when connection status, the user changes,
        // or the list of orders itself changes (to add/remove subscriptions).
        // Stable functions `subscribe` and `unsubscribe` are included.
        // `queryClient` is generally stable.
    }, [isConnected, orders, user, subscribe, unsubscribe, queryClient]);

    const handleUpdateStatus = (orderId: number, newStatus: OrderStatus) => {
        const request: UpdateOrderStatusRequestDTO = { newStatus };
        console.log(`CookDashboard: Initiating status update for order ${orderId} to ${newStatus}`);
        updateStatus({ id: orderId, request }, {
            // onSuccess/onError remain the same
            onSuccess: (updatedOrder) => {
                console.log(`CookDashboard: Status update API success for order ${orderId}`, updatedOrder);
                // Note: WebSocket message should ideally handle the UI update via cache.
                // Invalidation can be a fallback if WS is unreliable.
                // queryClient.invalidateQueries({ queryKey: orderKeys.list('cook') });
                // queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
            },
            onError: (err) => {
                console.error(`CookDashboard: Failed to update status for order ${orderId}:`, err);
                alert(`Error updating status: ${(err as ApiError)?.response?.data?.message || (err as ApiError)?.message || 'Unknown error'}`);
            }
        });
    };

    // Memoization and rendering logic remain the same...
    const categorizedOrders = useMemo(() => {
         // ... same as before ...
         if (!orders) return { pending: [], active: [], ready: [], other: [] };
         return orders.reduce((acc, order) => {
             if (order.status === 'PENDING') acc.pending.push(order);
             else if (['ACCEPTED', 'COOKING'].includes(order.status)) acc.active.push(order);
             else if (order.status === 'READY_FOR_PICKUP') acc.ready.push(order);
             else acc.other.push(order);
             return acc;
         }, { pending: [] as OrderDTO[], active: [] as OrderDTO[], ready: [] as OrderDTO[], other: [] as OrderDTO[] });
    }, [orders]);

    if (isLoading) {
        // ... same as before ...
        return <div className="container mx-auto p-4"><Spinner /> Loading Cook Dashboard...</div>;
    }

    if (isError) {
        // ... same as before ...
        const errorMessage = (error as ApiError)?.response?.data?.message || (error as ApiError)?.message || 'Could not load your orders.';
        return <div className="container mx-auto p-4 text-center text-red-600">{errorMessage}</div>;
    }

    const renderOrderCard = (order: OrderDTO) => {
        // ... same as before ...
         const isUpdatingThisOrder = isUpdatingStatus && updatingVariables?.id === order.id;
         return (
             <Card key={order.id} className="mb-4">
                 {/* Card content and buttons... same as before */}
                 <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-3 border-b">
                     <Link to={`/orders/${order.id}`} className="font-semibold hover:underline">Order #{order.id}</Link>
                     <OrderStatusBadge status={order.status} />
                     <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                 </div>
                 <div className="mb-3">
                     <p className="text-sm"><span className="font-medium">Customer:</span> {order.customerName}</p>
                     <p className="text-sm"><span className="font-medium">Total:</span> {formatPrice(Number(order.totalAmount))}</p>
                     <h4 className="text-xs font-medium text-gray-600 mt-2 mb-1">Items:</h4>
                     <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 pl-4">
                         {order.items.map(item => (
                             <li key={item.id}>
                                 {item.quantity} x {item.foodItemName}
                             </li>
                         ))}
                     </ul>
                 </div>
                 <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                     {order.status === 'PENDING' && (
                         <Button
                             size="sm"
                             variant="primary"
                             onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                             isLoading={isUpdatingThisOrder && updatingVariables?.request.newStatus === 'ACCEPTED'}
                             disabled={isUpdatingStatus}
                         >
                             Accept Order
                         </Button>
                     )}
                     {order.status === 'ACCEPTED' && (
                         <Button
                             size="sm"
                             variant="secondary"
                             onClick={() => handleUpdateStatus(order.id, 'COOKING')}
                             isLoading={isUpdatingThisOrder && updatingVariables?.request.newStatus === 'COOKING'}
                             disabled={isUpdatingStatus}
                         >
                             Start Cooking
                         </Button>
                     )}
                     {order.status === 'COOKING' && (
                         <Button
                             size="sm"
                             variant="success"
                             onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                             isLoading={isUpdatingThisOrder && updatingVariables?.request.newStatus === 'READY_FOR_PICKUP'}
                             disabled={isUpdatingStatus}
                         >
                             Mark as Ready for Pickup
                         </Button>
                     )}
                     {['PENDING', 'ACCEPTED'].includes(order.status) && (
                          <Button
                             size="sm"
                             variant="danger"
                             onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                             isLoading={isUpdatingThisOrder && updatingVariables?.request.newStatus === 'CANCELLED'}
                             disabled={isUpdatingStatus}
                          >
                              Cancel Order
                          </Button>
                     )}
                     <Link to={`/order-details/${order.id}`}>
                         <Button size="sm" variant="outline" disabled={isUpdatingStatus}>View Details</Button>
                     </Link>
                 </div>
             </Card>
         );
    };

    return (
        // JSX structure for rendering the dashboard remains the same...
        <div className="container mx-auto p-4 md:p-6">
            {/* Header and Refresh button... same as before */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cook Dashboard</h1>
                <div className="flex gap-2">
                     <Link to="/food/new">
                        <Button variant="primary" size="sm">Add New Food Item</Button>
                     </Link>
                     <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Refresh Orders'}
                     </Button>
                </div>
            </div>

            {/* Grid for order categories... same as before */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section>
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2">New Orders ({categorizedOrders.pending.length})</h2>
                    {categorizedOrders.pending.length === 0 ? (
                        <p className="text-sm text-gray-500">No new orders waiting for acceptance.</p>
                    ) : (
                        categorizedOrders.pending.map(renderOrderCard)
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2">In Progress ({categorizedOrders.active.length})</h2>
                    {categorizedOrders.active.length === 0 ? (
                        <p className="text-sm text-gray-500">No orders currently being prepared.</p>
                    ) : (
                        categorizedOrders.active.map(renderOrderCard)
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2">Ready for Pickup ({categorizedOrders.ready.length})</h2>
                    {categorizedOrders.ready.length === 0 ? (
                        <p className="text-sm text-gray-500">No orders waiting for delivery pickup.</p>
                    ) : (
                        categorizedOrders.ready.map(renderOrderCard)
                    )}
                </section>
            </div>
        </div>
    );
};

export default CookDashboardPage;