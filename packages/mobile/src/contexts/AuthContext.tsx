import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuthState, useLogin, useLogout } from '@flavorbot/shared';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuthState();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  useEffect(() => {
    // Initialize auth state on app start
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for stored auth token
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Token exists, user data will be fetched by useAuthState
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      // Store auth token for future app launches
      await SecureStore.setItemAsync('authToken', 'user-authenticated');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading: isLoading || !isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}