import {
  type UserData,
  type CreateUserData,
  type RecipeData,
  type RecipeListData,
  type CreateRecipeData,
  type UpdateRecipeData,
  type UpdateUserData,
  type UsageStatsData,
} from "@flavorbot/shared/utils/schemas.js";
import { MockDynamoDBStorage } from "./dynamodb-adapter.js";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<UserData | undefined>;
  createUser(user: CreateUserData): Promise<UserData>;
  updateUser(id: string, updates: UpdateUserData): Promise<UserData>;
  
  // Recipe operations
  createRecipe(userId: string, recipe: CreateRecipeData): Promise<RecipeData>;
  getRecipesByUser(userId: string, category?: string): Promise<RecipeListData[]>;
  getRecipe(id: number, userId: string): Promise<RecipeData | undefined>;
  updateRecipe(id: number, userId: string, updates: Partial<UpdateRecipeData>): Promise<RecipeData>;
  deleteRecipe(id: number, userId: string): Promise<void>;
  searchRecipes(userId: string, query: string): Promise<RecipeListData[]>;
  
  // Usage tracking
  getUsageForMonth(userId: string, month: string, queries: number, recipesGenerated: number): Promise<UsageStatsData>;
  // incrementUsage(userId: string, month: string, field: 'recipeQueries' | 'recipesGenerated'): Promise<void>;
  
  // Email verification
  verifyEmail(userId: string, token: string): Promise<boolean>;
  verifyEmailToken(email: string, token: string): Promise<boolean>;
  generateEmailVerificationToken(userId: string, email: string): Promise<string>;
  
  // User lookup by email
  getUserByEmail(email: string): Promise<UserData>;
}

// Use MockDynamoDBStorage for backend development
export const storage = new MockDynamoDBStorage();
