import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import {
    FoodItem,
    ApiError,
    CreateFoodItemRequest,
    UpdateFoodItemPayload,
} from '../types/api';

// Query Key Factory
const foodItemKeys = {
    all: ['foodItems'] as const,
    list: () => [...foodItemKeys.all, 'list'] as const,
    detail: (id: number | string | undefined) => [...foodItemKeys.all, 'detail', id] as const,
};

// API Calls
const fetchAllFoodItems = async (): Promise<FoodItem[]> => {
    const { data } = await api.get<FoodItem[]>('/food-items');
    return data;
};

const fetchFoodItemById = async (id: number | string): Promise<FoodItem> => {
    if (!id) throw new Error('Food item ID is required.');
    const { data } = await api.get<FoodItem>(`/food-items/${id}`);
    return data;
};

const createFoodItem = async (newItemData: CreateFoodItemRequest): Promise<FoodItem> => {
    const { data } = await api.post<FoodItem>('/food-items', newItemData);
    return data;
};

const updateFoodItem = async (payload: UpdateFoodItemPayload): Promise<FoodItem> => {
    const { id, data: updateData } = payload;
    const { data } = await api.put<FoodItem>(`/food-items/${id}`, updateData);
    return data;
};

const deleteFoodItem = async (id: number | string): Promise<void> => {
    await api.delete(`/food-items/${id}`);
};

// Query Hooks
export const useGetAllFoodItems = () =>
    useQuery<FoodItem[], ApiError>({
        queryKey: foodItemKeys.list(),
        queryFn: fetchAllFoodItems,
    });

export const useGetFoodItemById = (id: number | string | undefined) =>
    useQuery<FoodItem, ApiError>({
        queryKey: foodItemKeys.detail(id),
        queryFn: () => fetchFoodItemById(id!),
        enabled: !!id,
    });

// Mutation Hooks
export const useCreateFoodItem = () => {
    const queryClient = useQueryClient();
    return useMutation<FoodItem, ApiError, CreateFoodItemRequest>({
        mutationFn: createFoodItem,
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: foodItemKeys.list() });
            queryClient.setQueryData(foodItemKeys.detail(newItem.id), newItem);
            console.log('Food item created successfully', newItem);
        },
        onError: (error) => {
            console.error('Error creating food item:', error.message);
        },
    });
};

export const useUpdateFoodItem = () => {
    const queryClient = useQueryClient();
    return useMutation<FoodItem, ApiError, UpdateFoodItemPayload>({
        mutationFn: updateFoodItem,
        onSuccess: (updatedItem, variables) => {
            queryClient.invalidateQueries({ queryKey: foodItemKeys.list() });
            queryClient.invalidateQueries({ queryKey: foodItemKeys.detail(variables.id) });
            console.log('Food item updated successfully', updatedItem);
        },
        onError: (error, variables) => {
            console.error(`Error updating food item ${variables.id}:`, error.message);
        },
    });
};

export const useDeleteFoodItem = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, number | string>({
        mutationFn: deleteFoodItem,
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({ queryKey: foodItemKeys.list() });
            queryClient.removeQueries({ queryKey: foodItemKeys.detail(deletedId) });
            console.log(`Food item ${deletedId} deleted successfully`);
        },
        onError: (error, deletedId) => {
            console.error(`Error deleting food item ${deletedId}:`, error.message);
        },
    });
};
