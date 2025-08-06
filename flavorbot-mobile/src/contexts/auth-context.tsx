import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@flavorbot/shared/api-client';
import { User, InsertUser } from '@flavorbot/shared/schemas';

type LoginData = Pick<InsertUser, 'email' | 'password'>;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await apiClient.auth.getCurrentUser();
      } catch (error) {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const user = await apiClient.auth.login(credentials);
      await SecureStore.setItemAsync('auth_token', 'logged_in'); // Simple flag
      return user;
    },
    onSuccess: () => {
      refetchUser();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const user = await apiClient.auth.register(userData);
      await SecureStore.setItemAsync('auth_token', 'logged_in'); // Simple flag
      return user;
    },
    onSuccess: () => {
      refetchUser();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.auth.logout();
      await SecureStore.deleteItemAsync('auth_token');
    },
    onSuccess: () => {
      refetchUser();
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}