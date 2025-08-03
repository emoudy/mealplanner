import type { Platform } from '../types/index.js';

// Platform detection utilities
export const detectPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'web';
  
  // React Native detection
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'mobile';
  }
  
  // Electron detection
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return 'desktop';
  }
  
  return 'web';
};

export const isWeb = (): boolean => detectPlatform() === 'web';
export const isMobile = (): boolean => detectPlatform() === 'mobile';
export const isDesktop = (): boolean => detectPlatform() === 'desktop';

// Platform-specific feature detection
export const getFeatures = () => {
  const platform = detectPlatform();
  
  return {
    platform,
    hasFileSystem: platform === 'desktop',
    hasCamera: platform === 'mobile',
    hasNotifications: platform !== 'web' || 'Notification' in window,
    hasOfflineStorage: platform !== 'web' || 'indexedDB' in window,
    hasPushNotifications: platform === 'mobile',
    hasNativeSharing: platform === 'mobile' || (platform === 'web' && 'share' in navigator),
    hasAppStore: platform === 'mobile',
    canInstallPWA: platform === 'web',
  };
};

// Storage utilities (platform-agnostic)
export const storage = {
  get: async (key: string): Promise<string | null> => {
    const platform = detectPlatform();
    
    if (platform === 'mobile') {
      // Use React Native AsyncStorage or Expo SecureStore
      // This would be implemented in the mobile app
      return null;
    }
    
    if (platform === 'desktop') {
      // Use Electron's storage
      // This would be implemented in the desktop app
      return null;
    }
    
    // Web fallback
    return localStorage.getItem(key);
  },
  
  set: async (key: string, value: string): Promise<void> => {
    const platform = detectPlatform();
    
    if (platform === 'mobile') {
      // Use React Native AsyncStorage or Expo SecureStore
      return;
    }
    
    if (platform === 'desktop') {
      // Use Electron's storage
      return;
    }
    
    // Web fallback
    localStorage.setItem(key, value);
  },
  
  remove: async (key: string): Promise<void> => {
    const platform = detectPlatform();
    
    if (platform === 'mobile') {
      // Use React Native AsyncStorage or Expo SecureStore
      return;
    }
    
    if (platform === 'desktop') {
      // Use Electron's storage
      return;
    }
    
    // Web fallback
    localStorage.removeItem(key);
  },
};

// Navigation utilities
export const navigation = {
  goTo: (url: string) => {
    const platform = detectPlatform();
    
    if (platform === 'web') {
      window.location.href = url;
    }
    
    // Mobile and desktop would handle this differently
    // Implementation would be platform-specific
  },
  
  openExternal: (url: string) => {
    const platform = detectPlatform();
    
    if (platform === 'web') {
      window.open(url, '_blank');
    }
    
    // Mobile and desktop would handle this differently
    // Implementation would be platform-specific
  },
};