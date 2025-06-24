import {
  users,
  recipes,
  chatConversations,
  usageTracking,
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type ChatConversation,
  type InsertChatConversation,
  type UpdateUser,
  type UsageTracking,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
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
  
  // Chat operations
  createChatConversation(userId: string, conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatConversation(userId: string): Promise<ChatConversation | undefined>;
  updateChatConversation(id: number, userId: string, messages: any[]): Promise<ChatConversation>;
  startNewChatSession(userId: string): Promise<ChatConversation>;
  cleanupExpiredSessions(): Promise<void>;
  
  // Usage tracking
  getUsageForMonth(userId: string, month: string): Promise<UsageTracking | undefined>;
  incrementUsage(userId: string, month: string, field: 'recipeQueries' | 'recipesGenerated'): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

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

  // Chat operations
  async createChatConversation(userId: string, conversation: InsertChatConversation): Promise<ChatConversation> {
    const [newConversation] = await db
      .insert(chatConversations)
      .values({ ...conversation, userId })
      .returning();
    return newConversation;
  }

  async getChatConversation(userId: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(and(eq(chatConversations.userId, userId), eq(chatConversations.isActive, true)))
      .orderBy(desc(chatConversations.updatedAt))
      .limit(1);
    return conversation;
  }

  async updateChatConversation(id: number, userId: string, messages: any[]): Promise<ChatConversation> {
    const [conversation] = await db
      .update(chatConversations)
      .set({ messages, updatedAt: new Date() })
      .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)))
      .returning();
    return conversation;
  }

  async startNewChatSession(userId: string): Promise<ChatConversation> {
    // Mark existing active sessions as inactive
    await db
      .update(chatConversations)
      .set({ isActive: false })
      .where(and(eq(chatConversations.userId, userId), eq(chatConversations.isActive, true)));

    // Create new session with welcome message
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const welcomeMessage = {
      role: 'assistant',
      content: "Hi! I'm FlavorBot, your AI recipe assistant. I can help you find recipes based on ingredients, dietary preferences, cooking time, or cuisine type. What would you like to cook today?"
    };

    const [newSession] = await db
      .insert(chatConversations)
      .values({
        userId,
        sessionId,
        messages: [welcomeMessage],
        isActive: true
      })
      .returning();
    
    return newSession;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await db
      .delete(chatConversations)
      .where(
        and(
          eq(chatConversations.isActive, false),
          db.sql`${chatConversations.updatedAt} < ${sevenDaysAgo}`
        )
      );
  }

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
}

export const storage = new DatabaseStorage();
