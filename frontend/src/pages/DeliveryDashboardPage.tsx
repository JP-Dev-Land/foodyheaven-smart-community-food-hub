import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetUserProfile,
  useUpdateMyAvailability
} from '../services/userService';
import {
  useGetOrdersAvailableForDelivery,
  useAssignDeliveryAgent,
  useUpdateOrderStatus,
  useGetMyAssignedOrders
} from '../services/orderService';
import { useWebSocket } from '../contexts/WebSocketProvider';
import {
  OrderDTO,
  ApiError,
  AssignAgentRequestDTO,
  UpdateAvailabilityRequestDTO,
  UpdateOrderStatusRequestDTO,
  OrderStatus
} from '../types/api';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Switch from '../components/ui/Switch';
import { formatPrice, formatDate } from '../utils/formatters';
import OrderStatusBadge from '../components/order/OrderStatusBadge';

const orderKeys = {
  list: (type: string, id?: string | number) =>
    ['orders', 'list', { type, id }] as const,
  detail: (id: number | string | undefined) =>
    ['orders', 'detail', id] as const
};

const userKeys = {
  profile: () => ['users', 'profile', 'me'] as const
};

const DeliveryDashboardPage: React.FC = (): React.ReactElement => {
  const queryClient = useQueryClient();
  const { isConnected, subscribe, unsubscribe } = useWebSocket();

  const { data: profile, isLoading: loadingProfile } = useGetUserProfile();

  const {
    data: assignedOrders = [],
    isLoading: loadingAssigned,
    refetch: refetchAssigned
  } = useGetMyAssignedOrders();

  const [isAvailable, setIsAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    console.log("Profile : ", profile);
    if (profile?.available !== undefined) {
      setIsAvailable(profile.available);
    }
  }, [profile?.available]);

  const {
    data: availableOrders,
    isLoading: loadingAvailable,
    refetch: refetchAvailable
  } = useGetOrdersAvailableForDelivery();

  const { mutate: updateAvailability } = useUpdateMyAvailability();
  const { mutate: assignAgent, isPending: assigning } =
    useAssignDeliveryAgent();
  const { mutate: updateStatus, isPending: updatingStatus } =
    useUpdateOrderStatus();

  useEffect(() => {
    if (!isConnected || !profile) return;

    const availSub = subscribe('/topic/orders/available', () => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.list('available')
      });
    });

    const assignedSubs: string[] = [];
    assignedOrders.forEach((order) => {
      const sub = subscribe(
        `/topic/orders/${order.id}/status`,
        (msg) => {
          const updated: OrderDTO = JSON.parse(msg.body);
          queryClient.setQueryData(
            orderKeys.detail(order.id),
            updated
          );
          queryClient.invalidateQueries({
            queryKey: orderKeys.list('delivery', profile.id)
          });
        }
      );
      if (sub) assignedSubs.push(sub);
    });

    return () => {
      if (availSub) unsubscribe(availSub);
      assignedSubs.forEach((id) => unsubscribe(id));
    };
  }, [
    isConnected,
    subscribe,
    unsubscribe,
    queryClient,
    profile,
    assignedOrders
  ]);

  const toggleAvailability = async (newAvailability: boolean) => {
    console.log('Attempting to toggle availability to:', newAvailability);
    setIsUpdating(true);
    const req: UpdateAvailabilityRequestDTO = { available: newAvailability };

    updateAvailability(req, {
      onSuccess: () => {
        console.log('Successfully updated availability');
        setIsAvailable(newAvailability);
        queryClient.invalidateQueries({
          queryKey: userKeys.profile()
        });
      },
      onError: (err: unknown) => {
        console.error('Failed to update availability:', err);
        setIsAvailable(!newAvailability);
        alert(`Failed to update availability: ${(err as ApiError).message || 'Unknown error'}`);
      },
      onSettled: () => {
        console.log('Availability update settled');
        setIsUpdating(false);
      }
    });
  };

  const acceptOrder = (orderId: number) => {
    if (!profile) return;
    const req: AssignAgentRequestDTO = {
      deliveryAgentId: profile.id
    };
    assignAgent({ orderId, request: req }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orderKeys.list('available')
        });
        queryClient.invalidateQueries({
          queryKey: orderKeys.list('delivery', profile.id)
        });
        refetchAssigned();
      },
      onError: (err) =>
        alert(`Error: ${(err as ApiError).message || 'Unknown'}`)
    });
  };

  const changeOrderStatus = (
    orderId: number,
    status: OrderStatus
  ) => {
    const req: UpdateOrderStatusRequestDTO = {
      newStatus: status
    };
    updateStatus({ id: orderId, request: req }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orderKeys.detail(orderId)
        });
        queryClient.invalidateQueries({
          queryKey: orderKeys.list('delivery', profile?.id)
        });
        refetchAssigned();
      },
      onError: (err) =>
        alert(`Error: ${(err as ApiError).message || 'Unknown'}`)
    });
  };

  if (loadingProfile) {
    return (
      <div className="container mx-auto p-4">
        <Spinner /> Loading Profile...
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="container mx-auto p-4 text-red-600">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Delivery Dashboard</h1>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Availability</span>
          <div className="flex items-center space-x-2">
            <span
              className={
                isAvailable ? 'text-green-600' : 'text-red-600'
              }
            >
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <Switch
              checked={isAvailable}
              onChange={toggleAvailability}
              disabled={isUpdating || loadingProfile}
              ariaLabel="Toggle availability"
            />
            {isUpdating && <Spinner size="sm" />}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">
            Available Orders ({availableOrders?.length || 0})
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void refetchAvailable()}
            disabled={loadingAvailable}
          >
            {loadingAvailable ? (
              <Spinner size="sm" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
        {loadingAvailable ? (
          <Spinner />
        ) : availableOrders?.length ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {availableOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row justify-between p-4 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium">#{order.id}</p>
                  <p className="text-sm">Cook: {order.cookName}</p>
                  <p className="text-sm">Total: {formatPrice(Number(order.totalAmount))}</p>
                  <p className="text-xs text-gray-500">Pickup: Lat {order.pickupLocation?.latitude}, Lng {order.pickupLocation?.longitude}</p>
                  <p className="text-xs text-gray-500">Delivery: Lat {order.deliveryLocation?.latitude}, Lng {order.deliveryLocation?.longitude}</p>
                  <p className="text-xs text-gray-500">Placed: {formatDate(order.createdAt)}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => acceptOrder(order.id)}
                  disabled={!isAvailable || assigning}
                  isLoading={assigning}
                >
                  Accept
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No orders available.
          </p>
        )}
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">
            My Orders ({assignedOrders.length})
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void refetchAssigned()}
            disabled={loadingAssigned}
          >
            {loadingAssigned ? (
              <Spinner size="sm" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
        {loadingAssigned ? (
          <Spinner />
        ) : assignedOrders.length ? (
          <div className="space-y-4">
            {assignedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-md shadow"
              >
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">#{order.id}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-sm">Customer: {order.customerName}</p>
                <p className="text-sm">Total: {formatPrice(Number(order.totalAmount))}</p>
                <p className="text-xs text-gray-500">Pickup: Lat {order.pickupLocation?.latitude}, Lng {order.pickupLocation?.longitude}</p>
                <p className="text-xs text-gray-500">Delivery: Lat {order.deliveryLocation?.latitude}, Lng {order.deliveryLocation?.longitude}</p>
                <div className="mt-3 flex space-x-2">
                  {order.status === 'READY_FOR_PICKUP' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        changeOrderStatus(
                          order.id,
                          'OUT_FOR_DELIVERY'
                        )
                      }
                      isLoading={updatingStatus}
                      disabled={updatingStatus}
                    >
                      Pick Up
                    </Button>
                  )}
                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() =>
                        changeOrderStatus(order.id, 'DELIVERED')
                      }
                      isLoading={updatingStatus}
                      disabled={updatingStatus}
                    >
                      Deliver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No active orders.
          </p>
        )}
      </Card>
    </div>
  );
};

export default DeliveryDashboardPage;

