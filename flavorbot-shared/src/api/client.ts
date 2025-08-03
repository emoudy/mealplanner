import type { ApiResponse } from '../types/index.js';

// Platform detection
const getPlatform = (): 'web' | 'mobile' | 'desktop' => {
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

// Get base URL based on platform and environment
const getBaseUrl = (): string => {
  const platform = getPlatform();
  
  if (platform === 'web') {
    // For web, use relative URLs or environment-specific URLs
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  }
  
  if (platform === 'mobile') {
    // For mobile, use the production API or local development
    return process.env.NODE_ENV === 'production' 
      ? 'https://your-production-api.com' 
      : 'http://localhost:5000';
  }
  
  if (platform === 'desktop') {
    // For desktop, similar to mobile
    return process.env.NODE_ENV === 'production'
      ? 'https://your-production-api.com'
      : 'http://localhost:5000';
  }
  
  return 'http://localhost:5000';
};

// HTTP client with platform-specific implementations
class ApiClient {
  private baseUrl: string;
  private platform: string;

  constructor() {
    this.baseUrl = getBaseUrl();
    this.platform = getPlatform();
  }

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for session-based auth
      ...options,
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new ApiError(errorData.message || 'Request failed', response.status);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  async patch<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }
}

// Custom error class
class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiError };

// Utility functions
export const isUnauthorizedError = (error: any): boolean => {
  return error instanceof ApiError && error.status === 401;
};

export const isNetworkError = (error: any): boolean => {
  return error instanceof ApiError && error.status === 0;
};