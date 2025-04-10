import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import {
    OrderDTO,
    PlaceOrderRequestDTO,
    UpdateOrderStatusRequestDTO,
    ApiError
} from '../types/api';

// Query Key Factory
const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (type: string, id?: string | number) => [...orderKeys.lists(), { type, id }] as const, // type: 'my', 'cook', 'delivery', 'available'
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (id: number | string | undefined) => [...orderKeys.details(), id] as const,
};

// API Calls
const placeOrder = async (request: PlaceOrderRequestDTO): Promise<OrderDTO> => {
    const { data } = await api.post<OrderDTO>('/orders', request);
    return data;
};

const fetchMyOrders = async (): Promise<OrderDTO[]> => {
    const { data } = await api.get<OrderDTO[]>('/orders/my');
    return data;
};

const fetchOrderById = async (id: number | string): Promise<OrderDTO> => {
    if (!id) throw new Error("Order ID is required.");
    const { data } = await api.get<OrderDTO>(`/orders/${id}`);
    return data;
};

// TODO: to be added fetches for cook, delivery agent, available orders similarly...

const updateOrderStatus = async (params: { id: number | string; request: UpdateOrderStatusRequestDTO }): Promise<OrderDTO> => {
    const { id, request } = params;
    const { data } = await api.put<OrderDTO>(`/orders/${id}/status`, request);
    return data;
};

// Mutation Hooks
export const usePlaceOrder = () => {
    const queryClient = useQueryClient();
    return useMutation<OrderDTO, ApiError, PlaceOrderRequestDTO>({
        mutationFn: placeOrder,
        onSuccess: (newOrder) => {
            // Invalidate general order lists
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
            console.log('Order placed successfully', newOrder);
            // TODO: Success toast / redirect should be implemented
        },
        onError: (error) => {
            console.error('Error placing order:', error.message);
        },
    });
};

// Query Hooks
export const useGetMyOrders = () => {
    return useQuery<OrderDTO[], ApiError>({
        queryKey: orderKeys.list('my'),
        queryFn: fetchMyOrders,
    });
};

export const useGetOrderById = (id: number | string | undefined) => {
    return useQuery<OrderDTO, ApiError>({
        queryKey: orderKeys.detail(id),
        queryFn: () => fetchOrderById(id!),
        enabled: !!id,
    });
};

export const useUpdateOrderStatus = () => {
     const queryClient = useQueryClient();
     return useMutation<OrderDTO, ApiError, { id: number | string; request: UpdateOrderStatusRequestDTO }>({
         mutationFn: updateOrderStatus,
         onSuccess: (updatedOrder, variables) => {

            //  queryClient.invalidateQueries({ queryKey: orderKeys.all });
             queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
             queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
             console.log('Order status updated successfully', updatedOrder);
         },
         onError: (error, variables) => {
             console.error(`Error updating status for order ${variables.id}:`, error.message);
         },
     });
 };

// TODO: to be added hooks for cook, delivery agent, available orders similarly...