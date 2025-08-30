// Temporary type definitions until we properly set up @mealplanner/shared
export interface User {
  id: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  authProvider?: string;
  profileImageUrl: string | null; // Either a valid URL or null, never undefined
  subscriptionTier?: 'free' | 'premium' | 'pro';
  subscriptionStatus?: string;
  emailNotifications?: boolean;
  dietaryPreferences?: string[];
  bio?: string;
  darkMode?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpsertUser {
  id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  authProvider?: string;
  profileImageUrl: string | null; // Either a valid URL or null, never undefined
  subscriptionTier?: 'free' | 'premium' | 'pro';
  subscriptionStatus?: string;
  emailNotifications?: boolean;
  dietaryPreferences?: string[];
  bio?: string;
  darkMode?: boolean;
  createdAt?: Date;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: number;
  servings?: number;
  category?: string;
  imageUrl: string | null; // Either a valid URL or null, never undefined
  isFromAI?: boolean;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookTime?: number;
  servings?: number;
  category?: string;
  imageUrl: string | null; // Either a valid URL or null, never undefined
  isFromAI?: boolean;
}

export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  profileImageUrl?: string;
  subscriptionTier?: 'free' | 'premium' | 'pro';
}

export interface UsageTracking {
  id?: number;
  userId: string;
  month: string;
  recipeQueries: number;
  recipesGenerated: number;
  updatedAt?: Date;
}
