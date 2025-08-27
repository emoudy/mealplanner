// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication response types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    authProvider: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    profileImageUrl?: string;
  };
  requiresVerification?: boolean;
  developmentMode?: {
    verificationToken: string;
    verificationUrl: string;
  };
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}

// Recipe response types
export interface RecipeResponse {
  id: number;
  userId: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  category: string;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  isFromAI: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeListResponse extends PaginatedResponse<RecipeResponse> {}

// Chat response types
export interface ChatResponse {
  message: string;
  conversationId: string;
  suggestions?: string[];
  recipe?: Partial<RecipeResponse>;
}

// Usage tracking response types
export interface UsageStatsResponse {
  currentMonth: string;
  recipeQueries: number;
  recipesGenerated: number;
  remainingQueries: number;
  subscriptionTier: string;
  limits: {
    recipeQueries: number;
    recipesGenerated: number;
  };
}

// Error response types
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

// File upload response types
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}