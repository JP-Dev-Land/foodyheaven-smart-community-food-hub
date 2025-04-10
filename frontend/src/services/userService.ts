import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import {
    UserSummary,
    UserDetail,
    UpdateUserRequest,
    UserProfile,
    UpdateProfileRequest,
    ApiError,
    CreateUserRequest
} from '../types/api';

// Query Key Factory
const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: number | string | undefined) => [...userKeys.details(), id] as const,
    profile: () => [...userKeys.all, 'profile', 'me'] as const,
};

// --- API Calls ---

// Admin
const fetchAllUsers = async (): Promise<UserSummary[]> => {
    const { data } = await api.get<UserSummary[]>('/admin/users');
    return data;
};

const fetchUserById = async (id: number | string): Promise<UserDetail> => {
    const { data } = await api.get<UserDetail>(`/admin/users/${id}`);
    return data;
};

const createUser = async (request: CreateUserRequest): Promise<UserDetail> => {
    const { data } = await api.post<UserDetail>('/admin/users', request);
    return data;
};

const updateUser = async (params: { id: number | string; data: UpdateUserRequest }): Promise<UserDetail> => {
    const { id, data: updateData } = params;
    const { data } = await api.put<UserDetail>(`/admin/users/${id}`, updateData);
    return data;
};

const deleteUser = async (id: number | string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
};

// Self-Service
const fetchUserProfile = async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>('/users/me');
    return data;
};

const updateUserProfile = async (request: UpdateProfileRequest): Promise<UserProfile> => {
    const { data } = await api.put<UserProfile>('/users/me', request);
    return data;
};


// --- Query Hooks ---

// Admin
export const useGetAllUsers = () => {
    return useQuery<UserSummary[], ApiError>({
        queryKey: userKeys.lists(),
        queryFn: fetchAllUsers,
        // Keep data fresh, every 5 minutes
        staleTime: 5 * 60 * 1000, 
    });
};

export const useGetUserById = (id: number | string | undefined) => {
    return useQuery<UserDetail, ApiError>({
        queryKey: userKeys.detail(id),
        queryFn: () => fetchUserById(id!),
        enabled: !!id,
    });
};

// Self-Service
export const useGetUserProfile = () => {
    return useQuery<UserProfile, ApiError>({
        queryKey: userKeys.profile(),
        queryFn: fetchUserProfile,
    });
};


// --- Mutation Hooks ---

// Admin
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation<UserDetail, ApiError, CreateUserRequest>({
        mutationFn: createUser,
        onSuccess: (newUser) => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
            console.log('User created successfully', newUser);
            // TODO: Success feedback/redirect should happen in the component
        },
        onError: (error) => {
            console.error('Error creating user:', error.message);
            // TODO: Error feedback should happen in the component
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation<UserDetail, ApiError, { id: number | string; data: UpdateUserRequest }>({
        mutationFn: updateUser,
        onSuccess: (updatedUser, variables) => {
            // Invalidate list and the specific user detail
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            // Update the cache directly for immediate feedback
            queryClient.setQueryData(userKeys.detail(variables.id), updatedUser);
            console.log('User updated successfully', updatedUser);
            // TODO: Consider showing a success toast/notification
        },
        onError: (error, variables) => {
            console.error(`Error updating user ${variables.id}:`, error.message);
            // TODO: Consider showing an error toast/notification
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, number | string>({
        mutationFn: deleteUser,
        onSuccess: (_, deletedId) => {
            // Invalidate the list and remove detail query
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
            console.log(`User ${deletedId} deleted/disabled successfully`);
            // TODO: Consider showing a success toast/notification
        },
        onError: (error, deletedId) => {
            console.error(`Error deleting user ${deletedId}:`, error.message);
            // TODO: Consider showing an error toast/notification
        },
    });
};

// Self-Service
export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation<UserProfile, ApiError, UpdateProfileRequest>({
        mutationFn: updateUserProfile,
        onSuccess: (updatedProfile) => {
            // Invalidate and update the profile cache
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
            queryClient.setQueryData(userKeys.profile(), updatedProfile);
             console.log('Profile updated successfully', updatedProfile);
             // TODO: Consider showing a success toast/notification
        },
        onError: (error) => {
             console.error('Error updating profile:', error.message);
             // TODO: Consider showing an error toast/notification
        }
    });
};