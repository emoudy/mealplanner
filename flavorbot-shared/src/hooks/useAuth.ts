import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginData, RegisterData, EmailVerificationData } from "../schemas/index.js";
import type { AuthResponse } from "../types/index.js";
import { useApi } from "./useApi.js";

export function useAuth() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Get current user query
  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        const user = await api.auth.getCurrentUser();
        return user;
      } catch (error: any) {
        if (error.status === 401) {
          return null; // Not authenticated
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => api.auth.login(data),
    onSuccess: (response: AuthResponse) => {
      queryClient.setQueryData(["auth", "user"], response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => api.auth.register(data),
    onSuccess: (response: AuthResponse) => {
      if (!response.requiresVerification) {
        queryClient.setQueryData(["auth", "user"], response.user);
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.clear(); // Clear all cached data on logout
    },
  });

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (data: EmailVerificationData) => api.auth.verifyEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  return {
    // State
    user: userQuery.data || null,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    error: userQuery.error,

    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    verifyEmail: verifyEmailMutation.mutate,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,

    // Mutation errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    verifyEmailError: verifyEmailMutation.error,
  };
}