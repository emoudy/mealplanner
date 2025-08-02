import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/client';
import { User, LoginData, RegisterData } from '../types/auth';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
  session: ['auth', 'session'] as const,
};

// Get current user
export function useUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: () => apiRequest<User>('GET', '/api/auth/user'),
    retry: false, // Don't retry auth requests
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginData) => 
      apiRequest<{ user: User }>('POST', '/api/auth/login', data),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.user, response.user);
      queryClient.invalidateQueries(); // Refresh all queries after login
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterData) => 
      apiRequest<{ user: User }>('POST', '/api/auth/register', data),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.user, response.user);
      queryClient.invalidateQueries();
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      queryClient.setQueryData(authKeys.user, null);
    },
  });
}

// OAuth login (for web)
export function useOAuthLogin() {
  return {
    loginWithGoogle: () => {
      window.location.href = '/api/auth/google';
    },
    loginWithGitHub: () => {
      window.location.href = '/api/auth/github';
    },
  };
}

// Custom hook for auth state
export function useAuthState() {
  const { data: user, isLoading, error } = useUser();
  
  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}