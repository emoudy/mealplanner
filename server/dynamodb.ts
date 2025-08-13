import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand, 
  ScanCommand 
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined, // For local development
  credentials: (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey"
  }
});

export const docClient = DynamoDBDocumentClient.from(client);
export const tableName = process.env.DYNAMODB_TABLE_NAME || "flavorbot-dev";

// DynamoDB table structure:
// PK (Partition Key) | SK (Sort Key)        | Data
// USER#userId        | PROFILE              | User profile data
// USER#userId        | RECIPE#recipeId      | User's recipe
// USER#userId        | USAGE#YYYY-MM        | Monthly usage stats
// USER#userId        | SESSION#sessionId    | Session data
// USER#userId        | GROCERY#itemId       | Custom grocery item
// RECIPE#category    | RECIPE#recipeId      | Recipe by category (GSI)
// SEARCH#term        | RECIPE#recipeId      | Recipe search index (GSI)

// Utility functions for key generation
export const keys = {
  user: {
    profile: (userId: string) => ({ PK: `USER#${userId}`, SK: "PROFILE" }),
    recipe: (userId: string, recipeId: string) => ({ PK: `USER#${userId}`, SK: `RECIPE#${recipeId}` }),
    usage: (userId: string, month: string) => ({ PK: `USER#${userId}`, SK: `USAGE#${month}` }),
    session: (userId: string, sessionId: string) => ({ PK: `USER#${userId}`, SK: `SESSION#${sessionId}` }),
    groceryItem: (userId: string, itemId: string) => ({ PK: `USER#${userId}`, SK: `GROCERY#${itemId}` }),
  },
  recipe: {
    byCategory: (category: string, recipeId: string) => ({ PK: `RECIPE#${category}`, SK: `RECIPE#${recipeId}` }),
    search: (term: string, recipeId: string) => ({ PK: `SEARCH#${term.toLowerCase()}`, SK: `RECIPE#${recipeId}` }),
  },
  session: {
    data: (sessionId: string) => ({ PK: `SESSION#${sessionId}`, SK: "DATA" }),
  },
  mealPlan: {
    entry: (userId: string, date: string, entryId: string) => ({ PK: `USER#${userId}#MEALPLAN`, SK: `DATE#${date}#ENTRY#${entryId}` })
  }
};

// Generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate numeric ID for recipes (to maintain compatibility)
let recipeCounter = Date.now();
export function generateRecipeId(): number {
  return ++recipeCounter;
}