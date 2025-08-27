"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keys = exports.tableName = exports.docClient = void 0;
exports.generateId = generateId;
exports.generateRecipeId = generateRecipeId;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var client = new client_dynamodb_1.DynamoDBClient({
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
exports.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
exports.tableName = process.env.DYNAMODB_TABLE_NAME || "mealplanner-dev";
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
exports.keys = {
    user: {
        profile: function (userId) { return ({ PK: "USER#".concat(userId), SK: "PROFILE" }); },
        recipe: function (userId, recipeId) { return ({ PK: "USER#".concat(userId), SK: "RECIPE#".concat(recipeId) }); },
        usage: function (userId, month) { return ({ PK: "USER#".concat(userId), SK: "USAGE#".concat(month) }); },
        session: function (userId, sessionId) { return ({ PK: "USER#".concat(userId), SK: "SESSION#".concat(sessionId) }); },
        groceryItem: function (userId, itemId) { return ({ PK: "USER#".concat(userId), SK: "GROCERY#".concat(itemId) }); },
        savedGroceryList: function (userId) { return ({ PK: "USER#".concat(userId), SK: "SAVED_GROCERY_LIST" }); },
    },
    recipe: {
        byCategory: function (category, recipeId) { return ({ PK: "RECIPE#".concat(category), SK: "RECIPE#".concat(recipeId) }); },
        search: function (term, recipeId) { return ({ PK: "SEARCH#".concat(term.toLowerCase()), SK: "RECIPE#".concat(recipeId) }); },
    },
    session: {
        data: function (sessionId) { return ({ PK: "SESSION#".concat(sessionId), SK: "DATA" }); },
    },
    mealPlan: {
        entry: function (userId, date, entryId) { return ({ PK: "USER#".concat(userId, "#MEALPLAN"), SK: "DATE#".concat(date, "#ENTRY#").concat(entryId) }); }
    }
};
// Generate unique IDs
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
// Generate numeric ID for recipes (to maintain compatibility)
var recipeCounter = Date.now();
function generateRecipeId() {
    return ++recipeCounter;
}
