import { useQuery } from '@tanstack/react-query';
import api from './api';
import { AdminAnalyticsDTO, ApiError } from '../types/api';

// Query Key Factory
const analyticsKeys = {
    all: ['analytics'] as const,
    adminDashboard: () => [...analyticsKeys.all, 'admin', 'dashboard'] as const,
};

// --- API Calls ---
const fetchAdminDashboardAnalytics = async (): Promise<AdminAnalyticsDTO> => {
    const { data } = await api.get<AdminAnalyticsDTO>('/admin/analytics/dashboard');
    // Convert revenue string to number if necessary (depends on JSON serialization)
    if (typeof data.totalRevenue === 'string') {
        data.totalRevenue = parseFloat(data.totalRevenue);
    }
    return data;
};

// --- Query Hooks ---
export const useGetAdminDashboardAnalytics = () => {
    return useQuery<AdminAnalyticsDTO, ApiError>({
        queryKey: analyticsKeys.adminDashboard(),
        queryFn: fetchAdminDashboardAnalytics,
        // Optional: Add staleTime if analytics don't need to be real-time
        // staleTime: 5 * 60 * 1000, // 5 minutes
    });
};