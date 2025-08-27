"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBStorage = void 0;
var mock_data_js_1 = require("./mock-data.js");
var dynamodb_1 = require("./dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Remove bcrypt import as it's not needed for DynamoDB storage
var DynamoDBStorage = /** @class */ (function () {
    function DynamoDBStorage() {
    }
    // User operations
    DynamoDBStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.profile(id)
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!response.Item)
                            return [2 /*return*/, undefined];
                        return [2 /*return*/, {
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
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error getting user:", error_1);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.upsertUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, now, userItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = userData.id || (0, dynamodb_1.generateId)();
                        now = new Date().toISOString();
                        userItem = __assign(__assign({}, dynamodb_1.keys.user.profile(userId)), { id: userId, email: userData.email, password: userData.password, emailVerified: userData.emailVerified || false, emailVerificationToken: userData.emailVerificationToken, authProvider: userData.authProvider || "email", firstName: userData.firstName, lastName: userData.lastName, profileImageUrl: userData.profileImageUrl, subscriptionTier: userData.subscriptionTier || "free", subscriptionStatus: userData.subscriptionStatus || "active", emailNotifications: userData.emailNotifications !== false, dietaryPreferences: userData.dietaryPreferences || [], bio: userData.bio, darkMode: userData.darkMode || false, createdAt: userData.createdAt || now, updatedAt: now, EntityType: "USER_PROFILE" });
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                TableName: dynamodb_1.tableName,
                                Item: userItem
                            }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getUser(userId)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DynamoDBStorage.prototype.updateUser = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updateExpression, expressionAttributeValues, expressionAttributeNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateExpression = [];
                        expressionAttributeValues = {};
                        expressionAttributeNames = {};
                        Object.entries(updates).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (value !== undefined) {
                                updateExpression.push("#".concat(key, " = :").concat(key));
                                expressionAttributeValues[":".concat(key)] = value;
                                expressionAttributeNames["#".concat(key)] = key;
                            }
                        });
                        updateExpression.push("#updatedAt = :updatedAt");
                        expressionAttributeValues[":updatedAt"] = new Date().toISOString();
                        expressionAttributeNames["#updatedAt"] = "updatedAt";
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.profile(id),
                                UpdateExpression: "SET ".concat(updateExpression.join(", ")),
                                ExpressionAttributeValues: expressionAttributeValues,
                                ExpressionAttributeNames: expressionAttributeNames
                            }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getUser(id)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DynamoDBStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var response, item, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.ScanCommand({
                                TableName: dynamodb_1.tableName,
                                FilterExpression: "email = :email AND EntityType = :entityType",
                                ExpressionAttributeValues: {
                                    ":email": email,
                                    ":entityType": "USER_PROFILE"
                                }
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!response.Items || response.Items.length === 0)
                            return [2 /*return*/, undefined];
                        item = response.Items[0];
                        return [2 /*return*/, {
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
                            }];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error getting user by email:", error_2);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Recipe operations
    DynamoDBStorage.prototype.createRecipe = function (userId, recipe) {
        return __awaiter(this, void 0, void 0, function () {
            var recipeId, now, recipeItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        recipeId = (0, dynamodb_1.generateRecipeId)();
                        now = new Date().toISOString();
                        recipeItem = __assign(__assign({}, dynamodb_1.keys.user.recipe(userId, recipeId.toString())), { id: recipeId, userId: userId, title: recipe.title, description: recipe.description, ingredients: recipe.ingredients, instructions: recipe.instructions, category: recipe.category, cookTime: recipe.cookTime, servings: recipe.servings, imageUrl: recipe.imageUrl, isFromAI: recipe.isFromAI || false, createdAt: now, updatedAt: now, EntityType: "RECIPE" });
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                TableName: dynamodb_1.tableName,
                                Item: recipeItem
                            }))];
                    case 1:
                        _a.sent();
                        // Also create search indexes for the recipe
                        return [4 /*yield*/, this.createSearchIndexes(recipeId.toString(), recipe.title, recipe.ingredients)];
                    case 2:
                        // Also create search indexes for the recipe
                        _a.sent();
                        return [2 /*return*/, {
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
                            }];
                }
            });
        });
    };
    DynamoDBStorage.prototype.getRecipesByUser = function (userId, category) {
        return __awaiter(this, void 0, void 0, function () {
            var response, recipes, error_3, recipes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand(__assign({ TableName: dynamodb_1.tableName, KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)", ExpressionAttributeValues: {
                                    ":pk": "USER#".concat(userId),
                                    ":sk": "RECIPE#"
                                } }, (category && {
                                FilterExpression: "category = :category",
                                ExpressionAttributeValues: {
                                    ":pk": "USER#".concat(userId),
                                    ":sk": "RECIPE#",
                                    ":category": category
                                }
                            }))))];
                    case 1:
                        response = _a.sent();
                        recipes = (response.Items || []).map(function (item) { return ({
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
                        }); });
                        // In development, also include mock recipes for testing
                        if (process.env.NODE_ENV === 'development') {
                            recipes = __spreadArray(__spreadArray([], recipes, true), mock_data_js_1.mockRecipes, true);
                        }
                        if (category && category !== 'all') {
                            recipes = recipes.filter(function (recipe) { return recipe.category === category; });
                        }
                        return [2 /*return*/, recipes.sort(function (a, b) { var _a, _b; return (((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error getting recipes by user:", error_3);
                        // In development, fall back to mock recipes only
                        if (process.env.NODE_ENV === 'development') {
                            recipes = __spreadArray([], mock_data_js_1.mockRecipes, true);
                            if (category && category !== 'all') {
                                recipes = recipes.filter(function (recipe) { return recipe.category === category; });
                            }
                            return [2 /*return*/, recipes.sort(function (a, b) { var _a, _b; return (((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })];
                        }
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.getRecipe = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, mockRecipe, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.recipe(userId, id.toString())
                            }))];
                    case 1:
                        response = _a.sent();
                        if (response.Item) {
                            return [2 /*return*/, {
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
                                }];
                        }
                        // In development, also check mock recipes
                        if (process.env.NODE_ENV === 'development') {
                            mockRecipe = mock_data_js_1.mockRecipes.find(function (recipe) { return recipe.id === id; });
                            if (mockRecipe) {
                                return [2 /*return*/, mockRecipe];
                            }
                        }
                        return [2 /*return*/, undefined];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error getting recipe:", error_4);
                        // In development, fall back to mock recipes
                        if (process.env.NODE_ENV === 'development') {
                            return [2 /*return*/, mock_data_js_1.mockRecipes.find(function (recipe) { return recipe.id === id; })];
                        }
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.updateRecipe = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updateExpression, expressionAttributeValues, expressionAttributeNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateExpression = [];
                        expressionAttributeValues = {};
                        expressionAttributeNames = {};
                        Object.entries(updates).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            if (value !== undefined) {
                                updateExpression.push("#".concat(key, " = :").concat(key));
                                expressionAttributeValues[":".concat(key)] = value;
                                expressionAttributeNames["#".concat(key)] = key;
                            }
                        });
                        updateExpression.push("#updatedAt = :updatedAt");
                        expressionAttributeValues[":updatedAt"] = new Date().toISOString();
                        expressionAttributeNames["#updatedAt"] = "updatedAt";
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.recipe(userId, id.toString()),
                                UpdateExpression: "SET ".concat(updateExpression.join(", ")),
                                ExpressionAttributeValues: expressionAttributeValues,
                                ExpressionAttributeNames: expressionAttributeNames
                            }))];
                    case 1:
                        _a.sent();
                        if (!(updates.title || updates.ingredients)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updateSearchIndexes(id.toString(), updates.title, updates.ingredients)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.getRecipe(id, userId)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DynamoDBStorage.prototype.deleteRecipe = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.DeleteCommand({
                            TableName: dynamodb_1.tableName,
                            Key: dynamodb_1.keys.user.recipe(userId, id.toString())
                        }))];
                    case 1:
                        _a.sent();
                        // Also delete search indexes
                        return [4 /*yield*/, this.deleteSearchIndexes(id.toString())];
                    case 2:
                        // Also delete search indexes
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.searchRecipes = function (userId, query) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerQuery_1, recipes, response, mockResults, error_5, lowerQuery_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        lowerQuery_1 = query.toLowerCase();
                        recipes = [];
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
                                TableName: dynamodb_1.tableName,
                                KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
                                FilterExpression: "contains(title, :query) OR contains(description, :query)",
                                ExpressionAttributeValues: {
                                    ":pk": "USER#".concat(userId),
                                    ":sk": "RECIPE#",
                                    ":query": query
                                }
                            }))];
                    case 1:
                        response = _a.sent();
                        if (response.Items) {
                            recipes = response.Items.map(function (item) { return ({
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
                            }); });
                        }
                        // In development, also search mock recipes
                        if (process.env.NODE_ENV === 'development') {
                            mockResults = mock_data_js_1.mockRecipes.filter(function (recipe) {
                                var _a;
                                return recipe.title.toLowerCase().includes(lowerQuery_1) ||
                                    ((_a = recipe.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(lowerQuery_1)) ||
                                    recipe.category.toLowerCase().includes(lowerQuery_1);
                            });
                            recipes = __spreadArray(__spreadArray([], recipes, true), mockResults, true);
                        }
                        return [2 /*return*/, recipes.sort(function (a, b) { var _a, _b; return (((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error searching recipes:", error_5);
                        // In development, fall back to searching mock recipes only
                        if (process.env.NODE_ENV === 'development') {
                            lowerQuery_2 = query.toLowerCase();
                            return [2 /*return*/, mock_data_js_1.mockRecipes
                                    .filter(function (recipe) {
                                    var _a;
                                    return recipe.title.toLowerCase().includes(lowerQuery_2) ||
                                        ((_a = recipe.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(lowerQuery_2)) ||
                                        recipe.category.toLowerCase().includes(lowerQuery_2);
                                })
                                    .sort(function (a, b) { var _a, _b; return (((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })];
                        }
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Usage tracking operations
    DynamoDBStorage.prototype.getUsageForMonth = function (userId, month) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.usage(userId, month)
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!response.Item)
                            return [2 /*return*/, undefined];
                        return [2 /*return*/, {
                                id: response.Item.id || 1,
                                userId: response.Item.userId,
                                month: response.Item.month,
                                recipeQueries: response.Item.recipeQueries || 0,
                                recipesGenerated: response.Item.recipesGenerated || 0,
                                createdAt: new Date(response.Item.createdAt),
                                updatedAt: new Date(response.Item.updatedAt),
                            }];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error getting usage for month:", error_6);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.incrementUsage = function (userId, month, field) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.usage(userId, month),
                                UpdateExpression: "SET #field = if_not_exists(#field, :zero) + :inc, #updatedAt = :now, #userId = :userId, #month = :month",
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
                            }))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error("Error incrementing usage:", error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Email verification operations
    DynamoDBStorage.prototype.verifyEmail = function (userId, token) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUser(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user || user.emailVerificationToken !== token) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.updateUser(userId, {
                                emailVerified: true,
                                emailVerificationToken: null
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_8 = _a.sent();
                        console.error("Error verifying email:", error_8);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.verifyEmailToken = function (email, token) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getUserByEmail(email)];
                    case 1:
                        user = _a.sent();
                        if (!user || user.emailVerificationToken !== token) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.updateUser(user.id, {
                                emailVerified: true,
                                emailVerificationToken: null
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_9 = _a.sent();
                        console.error("Error verifying email token:", error_9);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.generateEmailVerificationToken = function (userId, email) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = (0, dynamodb_1.generateId)();
                        return [4 /*yield*/, this.updateUser(userId, {
                                emailVerificationToken: token
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, token];
                }
            });
        });
    };
    // Helper methods for search indexing
    DynamoDBStorage.prototype.createSearchIndexes = function (recipeId, title, ingredients) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, words;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        if (title) {
                            words = title.toLowerCase().split(/\s+/);
                            words.forEach(function (word) {
                                promises.push(dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                    TableName: dynamodb_1.tableName,
                                    Item: dynamodb_1.keys.recipe.search(word, recipeId)
                                })));
                            });
                        }
                        if (ingredients) {
                            ingredients.forEach(function (ingredient) {
                                var words = ingredient.toLowerCase().split(/\s+/);
                                words.forEach(function (word) {
                                    promises.push(dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                        TableName: dynamodb_1.tableName,
                                        Item: dynamodb_1.keys.recipe.search(word, recipeId)
                                    })));
                                });
                            });
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.updateSearchIndexes = function (recipeId, title, ingredients) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // For simplicity, delete old indexes and create new ones
                    return [4 /*yield*/, this.deleteSearchIndexes(recipeId)];
                    case 1:
                        // For simplicity, delete old indexes and create new ones
                        _a.sent();
                        return [4 /*yield*/, this.createSearchIndexes(recipeId, title, ingredients)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.deleteSearchIndexes = function (recipeId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    // Meal plan operations
    DynamoDBStorage.prototype.addRecipeToMealPlan = function (userId, date, recipeId, recipeTitle) {
        return __awaiter(this, void 0, void 0, function () {
            var existingEntries, mealPlanId, now, mealPlanEntry, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getMealPlanForDate(userId, date)];
                    case 1:
                        existingEntries = _a.sent();
                        if (existingEntries.length >= 10) {
                            throw new Error("Cannot add more than 10 recipes per day");
                        }
                        mealPlanId = (0, dynamodb_1.generateId)();
                        now = new Date().toISOString();
                        mealPlanEntry = {
                            id: parseInt(mealPlanId), // Convert to number for consistency
                            userId: userId,
                            date: date,
                            recipeId: recipeId,
                            recipeTitle: recipeTitle,
                            createdAt: now,
                        };
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                TableName: dynamodb_1.tableName,
                                Item: __assign(__assign(__assign({}, dynamodb_1.keys.mealPlan.entry(userId, date, mealPlanId)), mealPlanEntry), { EntityType: "MEAL_PLAN_ENTRY" })
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, mealPlanEntry];
                    case 3:
                        error_10 = _a.sent();
                        console.error("Error adding recipe to meal plan:", error_10);
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.removeRecipeFromMealPlan = function (userId, mealPlanEntryId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, item, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.ScanCommand({
                                TableName: dynamodb_1.tableName,
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
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!(response.Items && response.Items.length > 0)) return [3 /*break*/, 3];
                        item = response.Items[0];
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.DeleteCommand({
                                TableName: dynamodb_1.tableName,
                                Key: {
                                    PK: item.PK,
                                    SK: item.SK
                                }
                            }))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_11 = _a.sent();
                        console.error("Error removing recipe from meal plan:", error_11);
                        throw error_11;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.getMealPlanForDateRange = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var response, groupedByDate, _i, _a, item, entry, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
                                TableName: dynamodb_1.tableName,
                                KeyConditionExpression: "#pk = :pk AND #sk BETWEEN :startSk AND :endSk",
                                ExpressionAttributeNames: {
                                    "#pk": "PK",
                                    "#sk": "SK"
                                },
                                ExpressionAttributeValues: {
                                    ":pk": "USER#".concat(userId, "#MEALPLAN"),
                                    ":startSk": "DATE#".concat(startDate),
                                    ":endSk": "DATE#".concat(endDate, "#ZZZZ") // Use ZZZZ to ensure we get all entries for end date
                                }
                            }))];
                    case 1:
                        response = _b.sent();
                        groupedByDate = {};
                        if (response.Items) {
                            for (_i = 0, _a = response.Items; _i < _a.length; _i++) {
                                item = _a[_i];
                                entry = {
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
                        return [2 /*return*/, groupedByDate];
                    case 2:
                        error_12 = _b.sent();
                        console.error("Error getting meal plan for date range:", error_12);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.getMealPlanForDate = function (userId, date) {
        return __awaiter(this, void 0, void 0, function () {
            var response, entries, _i, _a, item, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
                                TableName: dynamodb_1.tableName,
                                KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
                                ExpressionAttributeNames: {
                                    "#pk": "PK",
                                    "#sk": "SK"
                                },
                                ExpressionAttributeValues: {
                                    ":pk": "USER#".concat(userId, "#MEALPLAN"),
                                    ":sk": "DATE#".concat(date)
                                }
                            }))];
                    case 1:
                        response = _b.sent();
                        entries = [];
                        if (response.Items) {
                            for (_i = 0, _a = response.Items; _i < _a.length; _i++) {
                                item = _a[_i];
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
                        return [2 /*return*/, entries];
                    case 2:
                        error_13 = _b.sent();
                        console.error("Error getting meal plan for date:", error_13);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Custom grocery item operations
    DynamoDBStorage.prototype.createCustomGroceryItem = function (userId, item) {
        return __awaiter(this, void 0, void 0, function () {
            var itemId, now, groceryItem, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        itemId = (0, dynamodb_1.generateId)();
                        now = new Date().toISOString();
                        groceryItem = __assign(__assign({}, dynamodb_1.keys.user.groceryItem(userId, itemId)), { id: itemId, userId: userId, name: item.name, category: item.category, quantity: item.quantity || "", unit: item.unit || "", createdAt: now, updatedAt: now, EntityType: "CUSTOM_GROCERY_ITEM" });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                TableName: dynamodb_1.tableName,
                                Item: groceryItem
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                id: itemId,
                                userId: userId,
                                name: item.name,
                                category: item.category,
                                quantity: item.quantity,
                                unit: item.unit,
                                createdAt: new Date(now),
                                updatedAt: new Date(now)
                            }];
                    case 3:
                        error_14 = _a.sent();
                        console.error("Error creating custom grocery item:", error_14);
                        throw error_14;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.getUserCustomGroceryItems = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, items, _i, _a, item, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.QueryCommand({
                                TableName: dynamodb_1.tableName,
                                KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
                                ExpressionAttributeNames: {
                                    "#pk": "PK",
                                    "#sk": "SK"
                                },
                                ExpressionAttributeValues: {
                                    ":pk": "USER#".concat(userId),
                                    ":sk": "GROCERY#"
                                }
                            }))];
                    case 1:
                        response = _b.sent();
                        items = [];
                        if (response.Items) {
                            for (_i = 0, _a = response.Items; _i < _a.length; _i++) {
                                item = _a[_i];
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
                        return [2 /*return*/, items];
                    case 2:
                        error_15 = _b.sent();
                        console.error("Error getting custom grocery items:", error_15);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.updateCustomGroceryItem = function (itemId, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var now, updateExpressions, expressionAttributeNames, expressionAttributeValues, response, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date().toISOString();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        updateExpressions = [];
                        expressionAttributeNames = {};
                        expressionAttributeValues = {};
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
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.UpdateCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.groceryItem(userId, itemId),
                                UpdateExpression: "SET ".concat(updateExpressions.join(", ")),
                                ExpressionAttributeNames: expressionAttributeNames,
                                ExpressionAttributeValues: expressionAttributeValues,
                                ReturnValues: "ALL_NEW"
                            }))];
                    case 2:
                        response = _a.sent();
                        if (!response.Attributes) {
                            throw new Error("Failed to update custom grocery item");
                        }
                        return [2 /*return*/, {
                                id: response.Attributes.id,
                                userId: response.Attributes.userId,
                                name: response.Attributes.name,
                                category: response.Attributes.category,
                                quantity: response.Attributes.quantity,
                                unit: response.Attributes.unit,
                                createdAt: new Date(response.Attributes.createdAt),
                                updatedAt: new Date(response.Attributes.updatedAt)
                            }];
                    case 3:
                        error_16 = _a.sent();
                        console.error("Error updating custom grocery item:", error_16);
                        throw error_16;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.deleteCustomGroceryItem = function (itemId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.DeleteCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.groceryItem(userId, itemId)
                            }))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_17 = _a.sent();
                        console.error("Error deleting custom grocery item:", error_17);
                        throw error_17;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.clearAllCustomGroceryItems = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var items, _i, items_1, item, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getUserCustomGroceryItems(userId)];
                    case 1:
                        items = _a.sent();
                        _i = 0, items_1 = items;
                        _a.label = 2;
                    case 2:
                        if (!(_i < items_1.length)) return [3 /*break*/, 5];
                        item = items_1[_i];
                        return [4 /*yield*/, this.deleteCustomGroceryItem(item.id, userId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_18 = _a.sent();
                        console.error("Error clearing custom grocery items:", error_18);
                        throw error_18;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Saved grocery list operations
    DynamoDBStorage.prototype.saveGroceryList = function (userId, list) {
        return __awaiter(this, void 0, void 0, function () {
            var now, groceryListData, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        now = new Date().toISOString();
                        groceryListData = __assign(__assign({}, list), { updatedAt: now });
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                TableName: dynamodb_1.tableName,
                                Item: __assign(__assign(__assign({}, dynamodb_1.keys.user.savedGroceryList(userId)), groceryListData), { EntityType: "SAVED_GROCERY_LIST" })
                            }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, groceryListData];
                    case 2:
                        error_19 = _a.sent();
                        console.error("Error saving grocery list:", error_19);
                        throw error_19;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.getSavedGroceryList = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.savedGroceryList(userId)
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!response.Item) {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/, {
                                id: response.Item.id,
                                userId: response.Item.userId,
                                items: response.Item.items,
                                createdAt: response.Item.createdAt,
                                updatedAt: response.Item.updatedAt,
                            }];
                    case 2:
                        error_20 = _a.sent();
                        console.error("Error getting saved grocery list:", error_20);
                        throw error_20;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.updateGroceryListItem = function (userId, itemId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var savedList, itemIndex, error_21;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSavedGroceryList(userId)];
                    case 1:
                        savedList = _a.sent();
                        if (!savedList) {
                            throw new Error("No saved grocery list found");
                        }
                        itemIndex = savedList.items.findIndex(function (item) { return item.id === itemId; });
                        if (itemIndex === -1) {
                            throw new Error("Item not found in grocery list");
                        }
                        savedList.items[itemIndex] = __assign(__assign({}, savedList.items[itemIndex]), updates);
                        return [4 /*yield*/, this.saveGroceryList(userId, savedList)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_21 = _a.sent();
                        console.error("Error updating grocery list item:", error_21);
                        throw error_21;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBStorage.prototype.deleteSavedGroceryList = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.DeleteCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.user.savedGroceryList(userId)
                            }))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_22 = _a.sent();
                        console.error("Error deleting saved grocery list:", error_22);
                        throw error_22;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DynamoDBStorage;
}());
exports.DynamoDBStorage = DynamoDBStorage;
