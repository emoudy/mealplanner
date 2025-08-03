import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { UsageStats } from '../types/index.js';

// Query key constants
export const USAGE_STATS_KEY = '/api/usage/stats';

// Hook for fetching usage statistics
export const useUsageStats = () => {
  return useQuery<UsageStats>({
    queryKey: [USAGE_STATS_KEY],
    queryFn: () => apiClient.get<UsageStats>(USAGE_STATS_KEY),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Hook for checking if user is approaching limits
export const useUsageLimits = () => {
  const { data: stats } = useUsageStats();

  const isApproachingLimit = (current: number, limit: number, threshold = 0.8) => {
    return current >= limit * threshold;
  };

  return {
    stats,
    isApproachingRecipeLimit: stats ? 
      isApproachingLimit(stats.recipeQueries, stats.recipeLimit) : false,
    isApproachingChatLimit: stats ? 
      isApproachingLimit(stats.chatQueries, stats.chatLimit) : false,
    remainingRecipes: stats ? 
      Math.max(0, stats.recipeLimit - stats.recipeQueries) : 0,
    remainingChats: stats ? 
      Math.max(0, stats.chatLimit - stats.chatQueries) : 0,
  };
};