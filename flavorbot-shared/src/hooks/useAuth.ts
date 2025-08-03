import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isUnauthorizedError } from '../api/client.js';
import type { AuthUser, AuthState } from '../types/index.js';

// Query key constants
export const AUTH_QUERY_KEY = '/api/auth/user';

// Custom hook for authentication
export const useAuth = (): AuthState & {
  login: () => void;
  logout: () => Promise<void>;
  refetch: () => void;
} => {
  const queryClient = useQueryClient();

  // Query for current user
  const { 
    data: user, 
    isLoading, 
    error,
    refetch 
  } = useQuery<AuthUser>({
    queryKey: [AUTH_QUERY_KEY],
    queryFn: () => apiClient.get<AuthUser>(AUTH_QUERY_KEY),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post('/api/logout'),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      // Platform-specific logout handling
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });

  const login = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/login';
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !isUnauthorizedError(error),
    login,
    logout,
    refetch,
  };
};

// Hook for checking if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

// Hook for getting current user
export const useCurrentUser = (): AuthUser | null => {
  const { user } = useAuth();
  return user;
};