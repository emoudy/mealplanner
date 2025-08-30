import {
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type UpdateUser,
  type UsageTracking,
} from "./types.js";
import type { MealPlanEntry, CreateMealPlanEntryData, MealPlanResponse, CustomGroceryItem, CreateCustomGroceryItem, SavedGroceryList, SavedGroceryItem } from "./storage";
import { IStorage } from "./storage";
import { mockRecipes } from "@mealplanner/shared";
import { docClient, tableName, keys, generateId, generateRecipeId } from "./dynamodb";
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
// Remove bcrypt import as it's not needed for DynamoDB storage

export class DynamoDBStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: keys.user.profile(id)
      }));

      if (!response.Item) return undefined;

      return {
        id: response.Item.id,
        email: response.Item.email,
        password: response.Item.password,
        emailVerified: response.Item.emailVerified || false,
        emailVerificationToken: response.Item.emailVerificationToken,
        authProvider: response.Item.authProvider || "email",
        firstName: response.Item.firstName,
        lastName: response.Item.lastName,
        profileImageUrl: response.Item.profileImageUrl,
        subscriptionTier: response.Item.subscriptionTier || "free",
        subscriptionStatus: response.Item.subscriptionStatus || "active",
        emailNotifications: response.Item.emailNotifications !== false,
        dietaryPreferences: response.Item.dietaryPreferences || [],
        bio: response.Item.bio,
        darkMode: response.Item.darkMode || false,
        createdAt: response.Item.createdAt ? new Date(response.Item.createdAt) : new Date(),
        updatedAt: response.Item.updatedAt ? new Date(response.Item.updatedAt) : new Date(),
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userId = userData.id || generateId();
    const now = new Date().toISOString();
    
    const userItem = {
      ...keys.user.profile(userId),
      id: userId,
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
      createdAt: userData.createdAt || now,
      updatedAt: now,
      EntityType: "USER_PROFILE"
    };

    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: userItem
    }));

    return await this.getUser(userId) as User;
  }

  async updateUser(id: string, updates: UpdateUser): Promise<User> {
    const updateExpression: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    updateExpression.push(`#updatedAt = :updatedAt`);
    expressionAttributeValues[`:updatedAt`] = new Date().toISOString();
    expressionAttributeNames[`#updatedAt`] = "updatedAt";

    await docClient.send(new UpdateCommand({
      TableName: tableName,
      Key: keys.user.profile(id),
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames
    }));

    return await this.getUser(id) as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Since we can't query by email directly, we need to scan
      // In production, you'd want a GSI for email lookups
      const response = await docClient.send(new ScanCommand({
        TableName: tableName,
        FilterExpression: "email = :email AND EntityType = :entityType",
        ExpressionAttributeValues: {
          ":email": email,
          ":entityType": "USER_PROFILE"
        }
      }));

      if (!response.Items || response.Items.length === 0) return undefined;

      const item = response.Items[0];
      return {
        id: item.id,
        email: item.email,
        password: item.password,
        emailVerified: item.emailVerified || false,
        emailVerificationToken: item.emailVerificationToken,
        authProvider: item.authProvider || "email",
        firstName: item.firstName,
        lastName: item.lastName,
        profileImageUrl: item.profileImageUrl,
        subscriptionTier: item.subscriptionTier || "free",
        subscriptionStatus: item.subscriptionStatus || "active",
        emailNotifications: item.emailNotifications !== false,
        dietaryPreferences: item.dietaryPreferences || [],
        bio: item.bio,
        darkMode: item.darkMode || false,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  // Recipe operations
  async createRecipe(userId: string, recipe: InsertRecipe): Promise<Recipe> {
    const recipeId = generateRecipeId();
    const now = new Date().toISOString();

    const recipeItem = {
      ...keys.user.recipe(userId, recipeId.toString()),
      id: recipeId,
      userId: userId,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      imageUrl: recipe.imageUrl,
      isFromAI: recipe.isFromAI || false,
      createdAt: now,
      updatedAt: now,
      EntityType: "RECIPE"
    };

    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: recipeItem
    }));

    // Also create search indexes for the recipe
    await this.createSearchIndexes(recipeId.toString(), recipe.title, recipe.ingredients as string[]);

    return {
      id: recipeId,
      userId: userId,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      category: recipe.category,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      imageUrl: recipe.imageUrl,
      isFromAI: recipe.isFromAI || false,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async getRecipesByUser(userId: string, category?: string): Promise<Recipe[]> {
    try {
      const response = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "RECIPE#"
        },
        ...(category && {
          FilterExpression: "category = :category",
          ExpressionAttributeValues: {
            ":pk": `USER#${userId}`,
            ":sk": "RECIPE#",
            ":category": category
          }
        })
      }));

      let recipes: Recipe[] = (response.Items || []).map(item => ({
        id: item.id,
        userId: item.userId,
        title: item.title,
        description: item.description,
        ingredients: item.ingredients,
        instructions: item.instructions,
        category: item.category,
        cookTime: item.cookTime,
        servings: item.servings,
        imageUrl: item.imageUrl,
        isFromAI: item.isFromAI || false,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));

      // In development, also include mock recipes for testing
      if (process.env.NODE_ENV === 'development') {
        recipes = [...recipes, ...mockRecipes];
      }

      if (category && category !== 'all') {
        recipes = recipes.filter(recipe => recipe.category === category);
      }

      return recipes.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    } catch (error) {
      console.error("Error getting recipes by user:", error);
      // In development, fall back to mock recipes only
      if (process.env.NODE_ENV === 'development') {
        let recipes = [...mockRecipes];
        if (category && category !== 'all') {
          recipes = recipes.filter(recipe => recipe.category === category);
        }
        return recipes.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      return [];
    }
  }

  async getRecipe(id: number, userId: string): Promise<Recipe | undefined> {
    try {
      // First try to get from user's own recipes
      const response = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: keys.user.recipe(userId, id.toString())
      }));

      if (response.Item) {
        return {
          id: response.Item.id,
          userId: response.Item.userId,
          title: response.Item.title,
          description: response.Item.description,
          ingredients: response.Item.ingredients,
          instructions: response.Item.instructions,
          category: response.Item.category,
          cookTime: response.Item.cookTime,
          servings: response.Item.servings,
          imageUrl: response.Item.imageUrl,
          isFromAI: response.Item.isFromAI || false,
          createdAt: new Date(response.Item.createdAt),
          updatedAt: new Date(response.Item.updatedAt),
        };
      }

      // In development, also check mock recipes
      if (process.env.NODE_ENV === 'development') {
        const mockRecipe = mockRecipes.find(recipe => recipe.id === id);
        if (mockRecipe) {
          return mockRecipe;
        }
      }

      return undefined;
    } catch (error) {
      console.error("Error getting recipe:", error);
      // In development, fall back to mock recipes
      if (process.env.NODE_ENV === 'development') {
        return mockRecipes.find(recipe => recipe.id === id);
      }
      return undefined;
    }
  }

  async updateRecipe(id: number, userId: string, updates: Partial<InsertRecipe>): Promise<Recipe> {
    const updateExpression: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    updateExpression.push(`#updatedAt = :updatedAt`);
    expressionAttributeValues[`:updatedAt`] = new Date().toISOString();
    expressionAttributeNames[`#updatedAt`] = "updatedAt";

    await docClient.send(new UpdateCommand({
      TableName: tableName,
      Key: keys.user.recipe(userId, id.toString()),
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames
    }));

    // Update search indexes if title or ingredients changed
    if (updates.title || updates.ingredients) {
      await this.updateSearchIndexes(id.toString(), updates.title, updates.ingredients as string[]);
    }

    return await this.getRecipe(id, userId) as Recipe;
  }

  async deleteRecipe(id: number, userId: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: tableName,
      Key: keys.user.recipe(userId, id.toString())
    }));

    // Also delete search indexes
    await this.deleteSearchIndexes(id.toString());
  }

  async searchRecipes(userId: string, query: string): Promise<Recipe[]> {
    try {
      const lowerQuery = query.toLowerCase();
      let recipes: Recipe[] = [];

      // Search in user's recipes by scanning with filter
      const response = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        FilterExpression: "contains(title, :query) OR contains(description, :query)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "RECIPE#",
          ":query": query
        }
      }));

      if (response.Items) {
        recipes = response.Items.map(item => ({
          id: item.id,
          userId: item.userId,
          title: item.title,
          description: item.description,
          ingredients: item.ingredients,
          instructions: item.instructions,
          category: item.category,
          cookTime: item.cookTime,
          servings: item.servings,
          imageUrl: item.imageUrl,
          isFromAI: item.isFromAI || false,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
      }

      // In development, also search mock recipes
      if (process.env.NODE_ENV === 'development') {
        const mockResults = mockRecipes.filter(recipe => 
          recipe.title.toLowerCase().includes(lowerQuery) ||
          recipe.description?.toLowerCase().includes(lowerQuery) ||
          recipe.category?.toLowerCase().includes(lowerQuery)
        );
        recipes = [...recipes, ...mockResults];
      }

      return recipes.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    } catch (error) {
      console.error("Error searching recipes:", error);
      // In development, fall back to searching mock recipes only
      if (process.env.NODE_ENV === 'development') {
        const lowerQuery = query.toLowerCase();
        return mockRecipes
          .filter(recipe => 
            recipe.title.toLowerCase().includes(lowerQuery) ||
            recipe.description?.toLowerCase().includes(lowerQuery) ||
            recipe.category?.toLowerCase().includes(lowerQuery)
          )
          .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      return [];
    }
  }

  // Usage tracking operations
  async getUsageForMonth(userId: string, month: string): Promise<UsageTracking | undefined> {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: keys.user.usage(userId, month)
      }));

      if (!response.Item) return undefined;

      return {
        id: response.Item.id || 1,
        userId: response.Item.userId,
        month: response.Item.month,
        recipeQueries: response.Item.recipeQueries || 0,
        recipesGenerated: response.Item.recipesGenerated || 0,
        updatedAt: new Date(response.Item.updatedAt),
      };
    } catch (error) {
      console.error("Error getting usage for month:", error);
      return undefined;
    }
  }

  async incrementUsage(userId: string, month: string, field: 'recipeQueries' | 'recipesGenerated'): Promise<void> {
    try {
      await docClient.send(new UpdateCommand({
        TableName: tableName,
        Key: keys.user.usage(userId, month),
        UpdateExpression: `SET #field = if_not_exists(#field, :zero) + :inc, #updatedAt = :now, #userId = :userId, #month = :month`,
        ExpressionAttributeNames: {
          "#field": field,
          "#updatedAt": "updatedAt",
          "#userId": "userId",
          "#month": "month"
        },
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
          ":now": new Date().toISOString(),
          ":userId": userId,
          ":month": month
        }
      }));
    } catch (error) {
      console.error("Error incrementing usage:", error);
    }
  }

  // Email verification operations
  async verifyEmail(userId: string, token: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user || user.emailVerificationToken !== token) {
        return false;
      }

      await this.updateUser(userId, {
        emailVerified: true,
        emailVerificationToken: null
      });

      return true;
    } catch (error) {
      console.error("Error verifying email:", error);
      return false;
    }
  }

  async verifyEmailToken(email: string, token: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user || user.emailVerificationToken !== token) {
        return false;
      }

      await this.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null
      });

      return true;
    } catch (error) {
      console.error("Error verifying email token:", error);
      return false;
    }
  }

  async generateEmailVerificationToken(userId: string, email: string): Promise<string> {
    const token = generateId();
    await this.updateUser(userId, {
      emailVerificationToken: token
    });
    return token;
  }

  // Helper methods for search indexing
  private async createSearchIndexes(recipeId: string, title?: string, ingredients?: string[]): Promise<void> {
    const promises: Promise<any>[] = [];

    if (title) {
      const words = title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        promises.push(
          docClient.send(new PutCommand({
            TableName: tableName,
            Item: keys.recipe.search(word, recipeId)
          }))
        );
      });
    }

    if (ingredients) {
      ingredients.forEach(ingredient => {
        const words = ingredient.toLowerCase().split(/\s+/);
        words.forEach(word => {
          promises.push(
            docClient.send(new PutCommand({
              TableName: tableName,
              Item: keys.recipe.search(word, recipeId)
            }))
          );
        });
      });
    }

    await Promise.all(promises);
  }

  private async updateSearchIndexes(recipeId: string, title?: string, ingredients?: string[]): Promise<void> {
    // For simplicity, delete old indexes and create new ones
    await this.deleteSearchIndexes(recipeId);
    await this.createSearchIndexes(recipeId, title, ingredients);
  }

  private async deleteSearchIndexes(recipeId: string): Promise<void> {
    // This would require scanning to find all search indexes for this recipe
    // In a production system, you'd maintain a reverse index
    // For now, we'll skip this implementation
  }

  // Meal plan operations
  async addRecipeToMealPlan(userId: string, date: string, recipeId: number, recipeTitle: string): Promise<MealPlanEntry> {
    try {
      // Check current entries for the date to enforce 10 recipe limit
      const existingEntries = await this.getMealPlanForDate(userId, date);
      if (existingEntries.length >= 10) {
        throw new Error("Cannot add more than 10 recipes per day");
      }

      const mealPlanId = generateId();
      const now = new Date();
      
      const mealPlanEntry: MealPlanEntry = {
        id: parseInt(mealPlanId), // Convert to number for consistency
        userId,
        date,
        recipeId,
        recipeTitle,
        createdAt: now,
      };

      await docClient.send(new PutCommand({
        TableName: tableName,
        Item: {
          ...keys.mealPlan.entry(userId, date, mealPlanId),
          ...mealPlanEntry,
          createdAt: now.toISOString(), // Store as ISO string in DynamoDB
          EntityType: "MEAL_PLAN_ENTRY"
        }
      }));

      return mealPlanEntry;
    } catch (error) {
      console.error("Error adding recipe to meal plan:", error);
      throw error;
    }
  }

  async removeRecipeFromMealPlan(userId: string, mealPlanEntryId: number): Promise<void> {
    try {
      // Note: We'd need to query to find the entry first since we don't have the date
      // For simplicity, we'll use a scan to find the entry
      const response = await docClient.send(new ScanCommand({
        TableName: tableName,
        FilterExpression: "#userId = :userId AND #entryId = :entryId AND #entityType = :entityType",
        ExpressionAttributeNames: {
          "#userId": "userId",
          "#entryId": "id",
          "#entityType": "EntityType"
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":entryId": mealPlanEntryId,
          ":entityType": "MEAL_PLAN_ENTRY"
        }
      }));

      if (response.Items && response.Items.length > 0) {
        const item = response.Items[0];
        await docClient.send(new DeleteCommand({
          TableName: tableName,
          Key: {
            PK: item.PK,
            SK: item.SK
          }
        }));
      }
    } catch (error) {
      console.error("Error removing recipe from meal plan:", error);
      throw error;
    }
  }

  async getMealPlanForDateRange(userId: string, startDate: string, endDate: string): Promise<MealPlanResponse> {
    try {
      const response = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "#pk = :pk AND #sk BETWEEN :startSk AND :endSk",
        ExpressionAttributeNames: {
          "#pk": "PK",
          "#sk": "SK"
        },
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}#MEALPLAN`,
          ":startSk": `DATE#${startDate}`,
          ":endSk": `DATE#${endDate}#ZZZZ` // Use ZZZZ to ensure we get all entries for end date
        }
      }));

      const groupedByDate: MealPlanResponse = {};
      
      if (response.Items) {
        for (const item of response.Items) {
          const entry: MealPlanEntry = {
            id: item.id,
            userId: item.userId,
            date: item.date,
            recipeId: item.recipeId,
            recipeTitle: item.recipeTitle,
            createdAt: item.createdAt,
          };

          if (!groupedByDate[entry.date]) {
            groupedByDate[entry.date] = [];
          }
          groupedByDate[entry.date].push(entry);
        }
      }

      return groupedByDate;
    } catch (error) {
      console.error("Error getting meal plan for date range:", error);
      return {};
    }
  }

  async getMealPlanForDate(userId: string, date: string): Promise<MealPlanEntry[]> {
    try {
      const response = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
        ExpressionAttributeNames: {
          "#pk": "PK",
          "#sk": "SK"
        },
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}#MEALPLAN`,
          ":sk": `DATE#${date}`
        }
      }));

      const entries: MealPlanEntry[] = [];
      
      if (response.Items) {
        for (const item of response.Items) {
          entries.push({
            id: item.id,
            userId: item.userId,
            date: item.date,
            recipeId: item.recipeId,
            recipeTitle: item.recipeTitle,
            createdAt: item.createdAt,
          });
        }
      }

      return entries;
    } catch (error) {
      console.error("Error getting meal plan for date:", error);
      return [];
    }
  }

  // Custom grocery item operations
  async createCustomGroceryItem(userId: string, item: CreateCustomGroceryItem): Promise<CustomGroceryItem> {
    const itemId = generateId();
    const now = new Date().toISOString();

    const groceryItem = {
      ...keys.user.groceryItem(userId, itemId),
      id: itemId,
      userId,
      name: item.name,
      category: item.category,
      quantity: item.quantity || "",
      unit: item.unit || "",
      createdAt: now,
      updatedAt: now,
      EntityType: "CUSTOM_GROCERY_ITEM"
    };

    try {
      await docClient.send(new PutCommand({
        TableName: tableName,
        Item: groceryItem
      }));

      return {
        id: itemId,
        userId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      };
    } catch (error) {
      console.error("Error creating custom grocery item:", error);
      throw error;
    }
  }

  async getUserCustomGroceryItems(userId: string): Promise<CustomGroceryItem[]> {
    try {
      const response = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
        ExpressionAttributeNames: {
          "#pk": "PK",
          "#sk": "SK"
        },
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "GROCERY#"
        }
      }));

      const items: CustomGroceryItem[] = [];

      if (response.Items) {
        for (const item of response.Items) {
          items.push({
            id: item.id,
            userId: item.userId,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          });
        }
      }

      return items;
    } catch (error) {
      console.error("Error getting custom grocery items:", error);
      return [];
    }
  }

  async updateCustomGroceryItem(itemId: string, userId: string, updates: Partial<CreateCustomGroceryItem>): Promise<CustomGroceryItem> {
    const now = new Date().toISOString();

    try {
      const updateExpressions = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      if (updates.name !== undefined) {
        updateExpressions.push("#name = :name");
        expressionAttributeNames["#name"] = "name";
        expressionAttributeValues[":name"] = updates.name;
      }

      if (updates.category !== undefined) {
        updateExpressions.push("#category = :category");
        expressionAttributeNames["#category"] = "category";
        expressionAttributeValues[":category"] = updates.category;
      }

      if (updates.quantity !== undefined) {
        updateExpressions.push("#quantity = :quantity");
        expressionAttributeNames["#quantity"] = "quantity";
        expressionAttributeValues[":quantity"] = updates.quantity;
      }

      if (updates.unit !== undefined) {
        updateExpressions.push("#unit = :unit");
        expressionAttributeNames["#unit"] = "unit";
        expressionAttributeValues[":unit"] = updates.unit;
      }

      updateExpressions.push("#updatedAt = :updatedAt");
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = now;

      const response = await docClient.send(new UpdateCommand({
        TableName: tableName,
        Key: keys.user.groceryItem(userId, itemId),
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW"
      }));

      if (!response.Attributes) {
        throw new Error("Failed to update custom grocery item");
      }

      return {
        id: response.Attributes.id,
        userId: response.Attributes.userId,
        name: response.Attributes.name,
        category: response.Attributes.category,
        quantity: response.Attributes.quantity,
        unit: response.Attributes.unit,
        createdAt: new Date(response.Attributes.createdAt),
        updatedAt: new Date(response.Attributes.updatedAt)
      };
    } catch (error) {
      console.error("Error updating custom grocery item:", error);
      throw error;
    }
  }

  async deleteCustomGroceryItem(itemId: string, userId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: tableName,
        Key: keys.user.groceryItem(userId, itemId)
      }));
    } catch (error) {
      console.error("Error deleting custom grocery item:", error);
      throw error;
    }
  }

  async clearAllCustomGroceryItems(userId: string): Promise<void> {
    try {
      const items = await this.getUserCustomGroceryItems(userId);
      
      for (const item of items) {
        await this.deleteCustomGroceryItem(item.id, userId);
      }
    } catch (error) {
      console.error("Error clearing custom grocery items:", error);
      throw error;
    }
  }

  // Saved grocery list operations
  async saveGroceryList(userId: string, list: SavedGroceryList): Promise<SavedGroceryList> {
    try {
      const now = new Date();
      const groceryListData = {
        ...list,
        updatedAt: now
      };

      await docClient.send(new PutCommand({
        TableName: tableName,
        Item: {
          ...keys.user.savedGroceryList(userId),
          ...groceryListData,
          updatedAt: now.toISOString(), // Store as ISO string in DynamoDB
          EntityType: "SAVED_GROCERY_LIST"
        }
      }));

      return groceryListData;
    } catch (error) {
      console.error("Error saving grocery list:", error);
      throw error;
    }
  }

  async getSavedGroceryList(userId: string): Promise<SavedGroceryList | undefined> {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: keys.user.savedGroceryList(userId)
      }));

      if (!response.Item) {
        return undefined;
      }

      return {
        id: response.Item.id,
        userId: response.Item.userId,
        items: response.Item.items,
        createdAt: response.Item.createdAt,
        updatedAt: response.Item.updatedAt,
      };
    } catch (error) {
      console.error("Error getting saved grocery list:", error);
      throw error;
    }
  }

  async updateGroceryListItem(userId: string, itemId: string, updates: Partial<SavedGroceryItem>): Promise<void> {
    try {
      const savedList = await this.getSavedGroceryList(userId);
      if (!savedList) {
        throw new Error("No saved grocery list found");
      }

      const itemIndex = savedList.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error("Item not found in grocery list");
      }

      savedList.items[itemIndex] = { ...savedList.items[itemIndex], ...updates };
      await this.saveGroceryList(userId, savedList);
    } catch (error) {
      console.error("Error updating grocery list item:", error);
      throw error;
    }
  }

  async deleteSavedGroceryList(userId: string): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: tableName,
        Key: keys.user.savedGroceryList(userId)
      }));
    } catch (error) {
      console.error("Error deleting saved grocery list:", error);
      throw error;
    }
  }
}