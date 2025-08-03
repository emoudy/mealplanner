import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useSharedAuth } from '@flavorbot/shared';

// Create context (optional - the shared hook can be used directly)
const AuthContext = createContext<ReturnType<typeof useSharedAuth> | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useSharedAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Re-export the shared hook for convenience
export { useSharedAuth as useAuth };