import {
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type UpdateUser,
  type UsageTracking,
} from "@flavorbot/shared/schemas";
// Import storage implementations
import { DynamoDBStorage } from "./dynamodb-storage";
import { MemoryStorage } from "./storage-fallback";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User>;

  // Recipe operations
  createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe>;
  getRecipesByUser(userId: string, category?: string): Promise<Recipe[]>;
  getRecipe(id: number, userId: string): Promise<Recipe | undefined>;
  updateRecipe(id: number, userId: string, updates: Partial<InsertRecipe>): Promise<Recipe>;
  deleteRecipe(id: number, userId: string): Promise<void>;
  searchRecipes(userId: string, query: string): Promise<Recipe[]>;

  // Usage tracking operations
  getUsageForMonth(userId: string, month: string): Promise<UsageTracking | undefined>;
  incrementUsage(userId: string, month: string, field: 'recipeQueries' | 'recipesGenerated'): Promise<void>;

  // Email verification operations
  generateEmailVerificationToken(userId: string, email: string): Promise<string>;
  verifyEmail(userId: string, token: string): Promise<boolean>;
  verifyEmailToken(email: string, token: string): Promise<boolean>;

  // User lookup by email
  getUserByEmail(email: string): Promise<User | undefined>;
}

// Create storage instance with fallback for development
function createStorage(): IStorage {
  // Check if we have AWS credentials
  const hasAWSCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  
  if (hasAWSCredentials) {
    console.log("Using DynamoDB storage (AWS credentials found)");
    return new DynamoDBStorage();
  } else {
    console.log("Using in-memory storage (no AWS credentials - development mode)");
    return new MemoryStorage();
  }
}

export const storage = createStorage();