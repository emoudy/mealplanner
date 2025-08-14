import {
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type UpdateUser,
  type UsageTracking,
} from "@flavorbot/shared";
import type { IStorage, CustomGroceryItem, CreateCustomGroceryItem, MealPlanEntry, CreateMealPlanEntryData, MealPlanResponse, SavedGroceryList, SavedGroceryItem } from "./storage";
import { createId } from "@paralleldrive/cuid2";
import { mockRecipes } from "../mock-data";

// In-memory fallback storage for development when DynamoDB is not available
export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private recipes: Map<number, Recipe> = new Map();
  private usage: Map<string, UsageTracking> = new Map();
  private mealPlans: Map<number, MealPlanEntry> = new Map();
  private customGroceryItems: Map<string, CustomGroceryItem> = new Map();
  private recipeIdCounter = 21; // Start after mock recipes
  private mealPlanIdCounter = 1;
  private groceryItemIdCounter = 1;

  constructor() {
    // Only initialize with mock recipes in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Loading mock recipes for testing');
      mockRecipes.forEach(recipe => {
        this.recipes.set(recipe.id, recipe);
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || createId(),
      email: userData.email,
      password: userData.password,
      emailVerified: userData.emailVerified || false,
      emailVerificationToken: userData.emailVerificationToken || null,
      authProvider: userData.authProvider || "email",
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl || null,
      subscriptionTier: userData.subscriptionTier || "free",
      subscriptionStatus: userData.subscriptionStatus || "active",
      emailNotifications: userData.emailNotifications !== false,
      dietaryPreferences: userData.dietaryPreferences || [],
      bio: userData.bio || null,
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
    let recipes;
    
    if (process.env.NODE_ENV === 'development') {
      // In development, show all recipes (including mock data) for testing
      recipes = Array.from(this.recipes.values());
    } else {
      // In production, only show user's own recipes
      recipes = Array.from(this.recipes.values()).filter(recipe => recipe.userId === userId);
    }
    
    return recipes
      .filter(recipe => !category || category === 'all' || recipe.category === category)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getRecipe(id: number, userId: string): Promise<Recipe | undefined> {
    const recipe = this.recipes.get(id);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, allow access to all recipes (including mock data)
      return recipe;
    } else {
      // In production, only allow access to user's own recipes
      return recipe?.userId === userId ? recipe : undefined;
    }
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
    let recipes;
    
    if (process.env.NODE_ENV === 'development') {
      // In development, search all recipes (including mock data)
      recipes = Array.from(this.recipes.values());
    } else {
      // In production, only search user's own recipes
      recipes = Array.from(this.recipes.values()).filter(recipe => recipe.userId === userId);
    }
    
    return recipes
      .filter(recipe => 
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.description?.toLowerCase().includes(lowerQuery) ||
        recipe.category.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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
      user.emailVerificationToken = null;
      user.updatedAt = new Date();
      return true;
    }
    return false;
  }

  async verifyEmailToken(email: string, token: string): Promise<boolean> {
    const users = Array.from(this.users.values());
    for (const user of users) {
      if (user.email === email && user.emailVerificationToken === token) {
        return true;
      }
    }
    return false;
  }

  async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    const token = createId();
    const user = this.users.get(userId);
    if (user) {
      user.emailVerificationToken = token;
      user.updatedAt = new Date();
    }
    return token;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    for (const user of users) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  // Meal plan operations
  async addRecipeToMealPlan(userId: string, date: string, recipeId: number, recipeTitle: string): Promise<MealPlanEntry> {
    const existingEntries = Array.from(this.mealPlans.values()).filter(entry => 
      entry.userId === userId && entry.date === date
    );

    if (existingEntries.length >= 10) {
      throw new Error("Cannot add more than 10 recipes per day");
    }

    const mealPlanEntry: MealPlanEntry = {
      id: this.mealPlanIdCounter++,
      userId,
      date,
      recipeId,
      recipeTitle,
      createdAt: new Date().toISOString(),
    };

    this.mealPlans.set(mealPlanEntry.id, mealPlanEntry);
    return mealPlanEntry;
  }

  async removeRecipeFromMealPlan(userId: string, mealPlanEntryId: number): Promise<void> {
    const entry = this.mealPlans.get(mealPlanEntryId);
    if (entry && entry.userId === userId) {
      this.mealPlans.delete(mealPlanEntryId);
    }
  }

  async getMealPlanForDateRange(userId: string, startDate: string, endDate: string): Promise<MealPlanResponse> {
    const entries = Array.from(this.mealPlans.values()).filter(entry => 
      entry.userId === userId && 
      entry.date >= startDate && 
      entry.date <= endDate
    );

    const groupedByDate: MealPlanResponse = {};
    for (const entry of entries) {
      if (!groupedByDate[entry.date]) {
        groupedByDate[entry.date] = [];
      }
      groupedByDate[entry.date].push(entry);
    }

    return groupedByDate;
  }

  async getMealPlanForDate(userId: string, date: string): Promise<MealPlanEntry[]> {
    return Array.from(this.mealPlans.values()).filter(entry => 
      entry.userId === userId && entry.date === date
    );
  }

  // Custom grocery item operations
  async createCustomGroceryItem(userId: string, item: CreateCustomGroceryItem): Promise<CustomGroceryItem> {
    const itemId = `grocery-${this.groceryItemIdCounter++}`;
    const now = new Date();

    const groceryItem: CustomGroceryItem = {
      id: itemId,
      userId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      createdAt: now,
      updatedAt: now
    };

    this.customGroceryItems.set(itemId, groceryItem);
    return groceryItem;
  }

  async getUserCustomGroceryItems(userId: string): Promise<CustomGroceryItem[]> {
    return Array.from(this.customGroceryItems.values()).filter(item => item.userId === userId);
  }

  async updateCustomGroceryItem(itemId: string, userId: string, updates: Partial<CreateCustomGroceryItem>): Promise<CustomGroceryItem> {
    const existing = this.customGroceryItems.get(itemId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Custom grocery item not found");
    }

    const updated: CustomGroceryItem = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.customGroceryItems.set(itemId, updated);
    return updated;
  }

  async deleteCustomGroceryItem(itemId: string, userId: string): Promise<void> {
    const existing = this.customGroceryItems.get(itemId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Custom grocery item not found");
    }

    this.customGroceryItems.delete(itemId);
  }

  async clearAllCustomGroceryItems(userId: string): Promise<void> {
    for (const [itemId, item] of this.customGroceryItems) {
      if (item.userId === userId) {
        this.customGroceryItems.delete(itemId);
      }
    }
  }

  // Saved grocery list operations (in-memory for development)
  private savedGroceryLists = new Map<string, SavedGroceryList>();

  async saveGroceryList(userId: string, list: SavedGroceryList): Promise<SavedGroceryList> {
    this.savedGroceryLists.set(userId, { ...list, updatedAt: new Date() });
    return this.savedGroceryLists.get(userId)!;
  }

  async getSavedGroceryList(userId: string): Promise<SavedGroceryList | undefined> {
    return this.savedGroceryLists.get(userId);
  }

  async updateGroceryListItem(userId: string, itemId: string, updates: Partial<SavedGroceryItem>): Promise<void> {
    const savedList = this.savedGroceryLists.get(userId);
    if (!savedList) {
      throw new Error("No saved grocery list found");
    }

    const itemIndex = savedList.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error("Item not found in grocery list");
    }

    savedList.items[itemIndex] = { ...savedList.items[itemIndex], ...updates };
    await this.saveGroceryList(userId, savedList);
  }

  async deleteSavedGroceryList(userId: string): Promise<void> {
    this.savedGroceryLists.delete(userId);
  }
}