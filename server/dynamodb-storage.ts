import {
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type UpdateUser,
  type UsageTracking,
} from "@flavorbot/shared/schemas";
import { IStorage } from "./storage";
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

      return (response.Items || []).map(item => ({
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
    } catch (error) {
      console.error("Error getting recipes by user:", error);
      return [];
    }
  }

  async getRecipe(id: number, userId: string): Promise<Recipe | undefined> {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: keys.user.recipe(userId, id.toString())
      }));

      if (!response.Item) return undefined;

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
    } catch (error) {
      console.error("Error getting recipe:", error);
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

      return (response.Items || []).map(item => ({
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
    } catch (error) {
      console.error("Error searching recipes:", error);
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
        createdAt: new Date(response.Item.createdAt),
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
}