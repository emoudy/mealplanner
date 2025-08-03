// Database schema types (copied from shared/schema.ts)
export interface Recipe {
  id: number;
  userId: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  cookTime: number;
  servings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: number;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UsageStats {
  currentMonth: string;
  recipeQueries: number;
  chatQueries: number;
  recipeLimit: number;
  chatLimit: number;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Recipe form types
export interface RecipeFormData {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  cookTime: number;
  servings: number;
}

// Chatbot types
export interface ChatSession {
  messages: ChatMessage[];
  isLoading: boolean;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Platform detection
export type Platform = 'web' | 'mobile' | 'desktop';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}