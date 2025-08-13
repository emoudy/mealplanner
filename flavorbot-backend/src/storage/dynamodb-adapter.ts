// DynamoDB Storage Adapter for Backend Repository
// This connects the backend repo to the main DynamoDB implementation

import { IStorage } from "./index.js";
import {
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type UpdateUser,
  type UsageTracking,
} from "@flavorbot/shared/schemas";

// For backend development, use in-memory mock storage
// In production, this would connect to the main DynamoDB implementation
export class MockDynamoDBStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private recipes: Map<number, Recipe> = new Map();
  private usage: Map<string, UsageTracking> = new Map();
  private recipeIdCounter = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || `user_${Date.now()}`,
      email: userData.email,
      password: userData.password,
      emailVerified: userData.emailVerified || false,
      emailVerificationToken: userData.emailVerificationToken,
      authProvider: userData.authProvider || "email",
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      subscriptionTier: userData.subscriptionTier || "free",
      subscriptionStatus: userData.subscriptionStatus || "active",
      emailNotifications: userData.emailNotifications !== false,
      dietaryPreferences: userData.dietaryPreferences || [],
      bio: userData.bio,
      darkMode: userData.darkMode || false,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error("User not found");
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe> {
    const newRecipe: Recipe = {
      id: this.recipeIdCounter++,
      userId,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      imageUrl: recipe.imageUrl,
      isFromAI: recipe.isFromAI || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.recipes.set(newRecipe.id, newRecipe);
    return newRecipe;
  }

  async getRecipesByUser(userId: string, category?: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.userId === userId)
      .filter(recipe => !category || category === 'all' || recipe.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecipe(id: number, userId: string): Promise<Recipe | undefined> {
    const recipe = this.recipes.get(id);
    return recipe?.userId === userId ? recipe : undefined;
  }

  async updateRecipe(id: number, userId: string, updates: Partial<InsertRecipe>): Promise<Recipe> {
    const existing = this.recipes.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Recipe not found");
    }
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: number, userId: string): Promise<void> {
    const existing = this.recipes.get(id);
    if (existing && existing.userId === userId) {
      this.recipes.delete(id);
    }
  }

  async searchRecipes(userId: string, query: string): Promise<Recipe[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.recipes.values())
      .filter(recipe => 
        recipe.userId === userId &&
        (recipe.title.toLowerCase().includes(lowerQuery) ||
         recipe.description?.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUsageForMonth(userId: string, month: string): Promise<UsageTracking | undefined> {
    return this.usage.get(`${userId}:${month}`);
  }

  async incrementUsage(userId: string, month: string, field: 'recipeQueries' | 'recipesGenerated'): Promise<void> {
    const key = `${userId}:${month}`;
    const existing = this.usage.get(key);
    
    if (existing) {
      existing[field] = (existing[field] || 0) + 1;
      existing.updatedAt = new Date();
    } else {
      const newUsage: UsageTracking = {
        id: Date.now(),
        userId,
        month,
        recipeQueries: field === 'recipeQueries' ? 1 : 0,
        recipesGenerated: field === 'recipesGenerated' ? 1 : 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.usage.set(key, newUsage);
    }
  }

  async verifyEmail(userId: string, token: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (user && user.emailVerificationToken === token) {
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.updatedAt = new Date();
      return true;
    }
    return false;
  }

  async verifyEmailToken(email: string, token: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.email === email && user.emailVerificationToken === token) {
        return true;
      }
    }
    return false;
  }

  async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const user = this.users.get(userId);
    if (user) {
      user.emailVerificationToken = token;
      user.updatedAt = new Date();
    }
    return token;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
}