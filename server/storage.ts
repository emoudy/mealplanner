import {
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type UpdateUser,
  type UsageTracking,
} from "@flavorbot/shared/schemas";
// Import DynamoDB storage implementation
import { DynamoDBStorage } from "./dynamodb-storage";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateUser): Promise<User>;
  
  // Recipe operations
  createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe>;
  getRecipesByUser(userId: string, category?: string): Promise<Recipe[]>;
  getRecipe(id: number, userId: string): Promise<Recipe | undefined>;
  updateRecipe(id: number, userId: string, updates: Partial<InsertRecipe>): Promise<Recipe>;
  deleteRecipe(id: number, userId: string): Promise<void>;
  searchRecipes(userId: string, query: string): Promise<Recipe[]>;
  
  // Chat operations - Now session-based only, no database storage needed
  
  // Usage tracking
  getUsageForMonth(userId: string, month: string): Promise<UsageTracking | undefined>;
  incrementUsage(userId: string, month: string, field: 'recipeQueries' | 'recipesGenerated'): Promise<void>;
  
  // Email verification
  verifyEmail(userId: string, token: string): Promise<boolean>;
  verifyEmailToken(email: string, token: string): Promise<boolean>;
  generateEmailVerificationToken(userId: string, email: string): Promise<string>;
  
  // User lookup by email
  getUserByEmail(email: string): Promise<User | undefined>;
}

// Legacy PostgreSQL storage - now commented out
/*
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Recipe operations
  async createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values({ ...recipe, userId })
      .returning();
    return newRecipe;
  }

  async getRecipesByUser(userId: string, category?: string): Promise<Recipe[]> {
    const conditions = [eq(recipes.userId, userId)];
    if (category && category !== 'all') {
      conditions.push(eq(recipes.category, category));
    }
    
    return await db
      .select()
      .from(recipes)
      .where(and(...conditions))
      .orderBy(desc(recipes.createdAt));
  }

  async getRecipe(id: number, userId: string): Promise<Recipe | undefined> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
    return recipe;
  }

  async updateRecipe(id: number, userId: string, updates: Partial<InsertRecipe>): Promise<Recipe> {
    const [recipe] = await db
      .update(recipes)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();
    return recipe;
  }

  async deleteRecipe(id: number, userId: string): Promise<void> {
    await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
  }

  async searchRecipes(userId: string, query: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(and(
        eq(recipes.userId, userId),
        // Simple text search - in production you might want to use full-text search
      ))
      .orderBy(desc(recipes.createdAt));
  }

  // Chat operations removed - now session-based only

  // Usage tracking
  async getUsageForMonth(userId: string, month: string): Promise<UsageTracking | undefined> {
    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(and(eq(usageTracking.userId, userId), eq(usageTracking.month, month)));
    return usage;
  }

  async incrementUsage(userId: string, month: string, field: 'recipeQueries' | 'recipesGenerated'): Promise<void> {
    const existing = await this.getUsageForMonth(userId, month);
    
    if (existing) {
      await db
        .update(usageTracking)
        .set({
          [field]: (existing[field] || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(usageTracking.id, existing.id));
    } else {
      await db
        .insert(usageTracking)
        .values({
          userId,
          month,
          [field]: 1,
        });
    }
  }

  // Email verification methods
  async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    await db
      .update(users)
      .set({
        emailVerificationToken: token,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return token;
  }

  async verifyEmail(userId: string, token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.emailVerificationToken, token)));
    
    if (!user) {
      return false;
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return true;
  }

  async verifyEmailToken(email: string, token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.emailVerificationToken, token)));
    
    return !!user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }
}
*/

// Use DynamoDB storage implementation
export const storage = new DynamoDBStorage();
