import { z } from 'zod';

// Base API configuration
export const API_BASE_URL = typeof window !== 'undefined' 
  ? '' // Use relative URLs in browser
  : process.env.API_BASE_URL || 'http://localhost:5000';

// Error types
export class APIError extends Error {
  constructor(public status: number, message: string, public response?: any) {
    super(message);
    this.name = 'APIError';
  }
}

export class UnauthorizedError extends APIError {
  constructor() {
    super(401, 'Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

// Generic API request function
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for cookies/sessions
    ...options,
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      throw new UnauthorizedError();
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Fallback to status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }
      throw new APIError(response.status, errorMessage);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response.text() as unknown as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new APIError(0, `Network error: ${message}`);
  }
}

// Utility function to check if error is unauthorized
export function isUnauthorizedError(error: any): error is UnauthorizedError {
  return error instanceof UnauthorizedError || error?.status === 401;
}