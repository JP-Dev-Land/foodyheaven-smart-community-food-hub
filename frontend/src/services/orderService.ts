import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import axios from 'axios';
import {
    OrderDTO,
    PlaceOrderRequestDTO,
    UpdateOrderStatusRequestDTO,
    ApiError,
    AssignAgentRequestDTO
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

const fetchOrdersAvailableForDelivery = async (): Promise<OrderDTO[]> => {
    const { data } = await api.get<OrderDTO[]>('/orders/available-for-delivery');
    return data;
};

const fetchMyAssignedOrders = async (): Promise<OrderDTO[]> => {
    const { data } = await api.get<OrderDTO[]>('/orders/delivery');
    return data;
};

const assignDeliveryAgent = async (params: { orderId: number | string; request: AssignAgentRequestDTO }): Promise<OrderDTO> => {
    const { orderId, request } = params;
    const { data } = await api.post<OrderDTO>(`/orders/${orderId}/assign-agent`, request);
    return data;
};

const updateOrderStatus = async (params: { id: number | string; request: UpdateOrderStatusRequestDTO }): Promise<OrderDTO> => {
    const { id, request } = params;
    const { data } = await api.put<OrderDTO>(`/orders/${id}/status`, request);
    return data;
};

const fetchCookOrders = async (): Promise<OrderDTO[]> => {
    // Assumes the backend endpoint /api/orders/cook exists and returns orders for the logged-in cook
    const { data } = await api.get<OrderDTO[]>('/orders/cook');
    return data;
};

export const getOptimalRoute = async (origin: string, destination: string) => {
    try {
        const response = await api.get(`${API_BASE_URL}/orders/route`, {
            params: { origin, destination },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch optimal route:', error);
        throw error;
    }
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

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation<OrderDTO, ApiError, { id: number | string; request: UpdateOrderStatusRequestDTO }>({
        mutationFn: updateOrderStatus,
        onSuccess: (updatedOrder, variables) => {
            // Invalidate lists and details
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
            // Update cache directly
            queryClient.setQueryData(orderKeys.detail(variables.id), updatedOrder);
            console.log('Order status updated successfully', updatedOrder);
            // TODO: Success notification
        },
        onError: (error, variables) => {
            console.error(`Error updating status for order ${variables.id}:`, error.message);
            // TODO: Error notification
        },
    });
};

export const useAssignDeliveryAgent = () => {
    const queryClient = useQueryClient();
    return useMutation<OrderDTO, ApiError, { orderId: number | string; request: AssignAgentRequestDTO }>({
        mutationFn: assignDeliveryAgent,
        onSuccess: (updatedOrder) => {
            // Invalidate relevant order lists and details
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            // Specifically invalidate lists that might show available orders or agent-specific lists
            queryClient.invalidateQueries({ queryKey: orderKeys.list('available') });
            // If you have agent-specific lists:
            // queryClient.invalidateQueries({ queryKey: orderKeys.list('delivery', updatedOrder.deliveryAgentId) });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(updatedOrder.id) });
            queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder); // Update cache
            console.log(`Agent assigned to order ${updatedOrder.id}`);
            // TODO: Success notification
        },
        onError: (error, variables) => {
            console.error(`Error assigning agent to order ${variables.orderId}:`, error.message);
            // TODO: Error notification
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

export const useGetOrdersAvailableForDelivery = () => {
    return useQuery<OrderDTO[], ApiError>({
        queryKey: orderKeys.list('available'),
        queryFn: fetchOrdersAvailableForDelivery,
    });
};

export const useGetCookOrders = () => {
    return useQuery<OrderDTO[], ApiError>({
        queryKey: orderKeys.list('cook'), // Use 'cook' as the type identifier
        queryFn: fetchCookOrders,
        // Optional: Add staleTime if needed
    });
};

export const useGetMyAssignedOrders = () => {
    return useQuery<OrderDTO[], ApiError>({
        queryKey: orderKeys.list('delivery'),
        queryFn: fetchMyAssignedOrders,
    });
};

// TODO: Add hooks for cook, delivery agent orders similarly...
// export const useGetDeliveryAgentOrders = () => ...