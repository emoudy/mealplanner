import { QueryClient } from '@tanstack/react-query';
import { apiClient } from '@flavorbot/shared';

// Create query client with default fetcher
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = Array.isArray(queryKey) ? queryKey[0] as string : queryKey as string;
        return apiClient.get(url);
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

// Export api request function for mutations
export const apiRequest = apiClient.request.bind(apiClient);