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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorage = void 0;
var cuid2_1 = require("@paralleldrive/cuid2");
var mock_data_js_1 = require("./mock-data.js");
// In-memory fallback storage for development when DynamoDB is not available
var MemoryStorage = /** @class */ (function () {
    function MemoryStorage() {
        var _this = this;
        this.users = new Map();
        this.recipes = new Map();
        this.usage = new Map();
        this.mealPlans = new Map();
        this.customGroceryItems = new Map();
        this.recipeIdCounter = 21; // Start after mock recipes
        this.mealPlanIdCounter = 1;
        this.groceryItemIdCounter = 1;
        // Saved grocery list operations (in-memory for development)
        this.savedGroceryLists = new Map();
        // Only initialize with mock recipes in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Loading mock recipes for testing');
            mock_data_js_1.mockRecipes.forEach(function (recipe) {
                _this.recipes.set(recipe.id, recipe);
            });
        }
    }
    MemoryStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    MemoryStorage.prototype.upsertUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            var _a, _b;
            return __generator(this, function (_c) {
                user = {
                    id: userData.id || (0, cuid2_1.createId)(),
                    email: userData.email,
                    password: userData.password,
                    emailVerified: userData.emailVerified || false,
                    emailVerificationToken: userData.emailVerificationToken || null,
                    authProvider: userData.authProvider || "email",
                    firstName: (_a = userData.firstName) !== null && _a !== void 0 ? _a : null,
                    lastName: (_b = userData.lastName) !== null && _b !== void 0 ? _b : null,
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
                return [2 /*return*/, user];
            });
        });
    };
    MemoryStorage.prototype.updateUser = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.users.get(id);
                if (!existing)
                    throw new Error("User not found");
                updated = __assign(__assign(__assign({}, existing), updates), { updatedAt: new Date() });
                this.users.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemoryStorage.prototype.createRecipe = function (userId, recipe) {
        return __awaiter(this, void 0, void 0, function () {
            var newRecipe;
            return __generator(this, function (_a) {
                newRecipe = {
                    id: this.recipeIdCounter++,
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
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                this.recipes.set(newRecipe.id, newRecipe);
                return [2 /*return*/, newRecipe];
            });
        });
    };
    MemoryStorage.prototype.getRecipesByUser = function (userId, category) {
        return __awaiter(this, void 0, void 0, function () {
            var recipes;
            return __generator(this, function (_a) {
                if (process.env.NODE_ENV === 'development') {
                    // In development, show all recipes (including mock data) for testing
                    recipes = Array.from(this.recipes.values());
                }
                else {
                    // In production, only show user's own recipes
                    recipes = Array.from(this.recipes.values()).filter(function (recipe) { return recipe.userId === userId; });
                }
                return [2 /*return*/, recipes
                        .filter(function (recipe) { return !category || category === 'all' || recipe.category === category; })
                        .sort(function (a, b) { var _a, _b; return (((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })];
            });
        });
    };
    MemoryStorage.prototype.getRecipe = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var recipe;
            return __generator(this, function (_a) {
                recipe = this.recipes.get(id);
                if (process.env.NODE_ENV === 'development') {
                    // In development, allow access to all recipes (including mock data)
                    return [2 /*return*/, recipe];
                }
                else {
                    // In production, only allow access to user's own recipes
                    return [2 /*return*/, (recipe === null || recipe === void 0 ? void 0 : recipe.userId) === userId ? recipe : undefined];
                }
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.updateRecipe = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.recipes.get(id);
                if (!existing || existing.userId !== userId) {
                    throw new Error("Recipe not found");
                }
                updated = __assign(__assign(__assign({}, existing), updates), { updatedAt: new Date() });
                this.recipes.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemoryStorage.prototype.deleteRecipe = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            return __generator(this, function (_a) {
                existing = this.recipes.get(id);
                if (existing && existing.userId === userId) {
                    this.recipes.delete(id);
                }
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.searchRecipes = function (userId, query) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerQuery, recipes;
            return __generator(this, function (_a) {
                lowerQuery = query.toLowerCase();
                if (process.env.NODE_ENV === 'development') {
                    // In development, search all recipes (including mock data)
                    recipes = Array.from(this.recipes.values());
                }
                else {
                    // In production, only search user's own recipes
                    recipes = Array.from(this.recipes.values()).filter(function (recipe) { return recipe.userId === userId; });
                }
                return [2 /*return*/, recipes
                        .filter(function (recipe) {
                        var _a;
                        return recipe.title.toLowerCase().includes(lowerQuery) ||
                            ((_a = recipe.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(lowerQuery)) ||
                            recipe.category.toLowerCase().includes(lowerQuery);
                    })
                        .sort(function (a, b) { var _a, _b; return (((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })];
            });
        });
    };
    MemoryStorage.prototype.getUsageForMonth = function (userId, month) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.usage.get("".concat(userId, ":").concat(month))];
            });
        });
    };
    MemoryStorage.prototype.incrementUsage = function (userId, month, field) {
        return __awaiter(this, void 0, void 0, function () {
            var key, existing, newUsage;
            return __generator(this, function (_a) {
                key = "".concat(userId, ":").concat(month);
                existing = this.usage.get(key);
                if (existing) {
                    existing[field] = (existing[field] || 0) + 1;
                    existing.updatedAt = new Date();
                }
                else {
                    newUsage = {
                        id: Date.now(),
                        userId: userId,
                        month: month,
                        recipeQueries: field === 'recipeQueries' ? 1 : 0,
                        recipesGenerated: field === 'recipesGenerated' ? 1 : 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    this.usage.set(key, newUsage);
                }
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.verifyEmail = function (userId, token) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = this.users.get(userId);
                if (user && user.emailVerificationToken === token) {
                    user.emailVerified = true;
                    user.emailVerificationToken = null;
                    user.updatedAt = new Date();
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            });
        });
    };
    MemoryStorage.prototype.verifyEmailToken = function (email, token) {
        return __awaiter(this, void 0, void 0, function () {
            var users, _i, users_1, user;
            return __generator(this, function (_a) {
                users = Array.from(this.users.values());
                for (_i = 0, users_1 = users; _i < users_1.length; _i++) {
                    user = users_1[_i];
                    if (user.email === email && user.emailVerificationToken === token) {
                        return [2 /*return*/, true];
                    }
                }
                return [2 /*return*/, false];
            });
        });
    };
    MemoryStorage.prototype.generateEmailVerificationToken = function (userId, email) {
        return __awaiter(this, void 0, void 0, function () {
            var token, user;
            return __generator(this, function (_a) {
                token = (0, cuid2_1.createId)();
                user = this.users.get(userId);
                if (user) {
                    user.emailVerificationToken = token;
                    user.updatedAt = new Date();
                }
                return [2 /*return*/, token];
            });
        });
    };
    MemoryStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var users, _i, users_2, user;
            return __generator(this, function (_a) {
                users = Array.from(this.users.values());
                for (_i = 0, users_2 = users; _i < users_2.length; _i++) {
                    user = users_2[_i];
                    if (user.email === email) {
                        return [2 /*return*/, user];
                    }
                }
                return [2 /*return*/, undefined];
            });
        });
    };
    // Meal plan operations
    MemoryStorage.prototype.addRecipeToMealPlan = function (userId, date, recipeId, recipeTitle) {
        return __awaiter(this, void 0, void 0, function () {
            var existingEntries, mealPlanEntry;
            return __generator(this, function (_a) {
                existingEntries = Array.from(this.mealPlans.values()).filter(function (entry) {
                    return entry.userId === userId && entry.date === date;
                });
                if (existingEntries.length >= 10) {
                    throw new Error("Cannot add more than 10 recipes per day");
                }
                mealPlanEntry = {
                    id: this.mealPlanIdCounter++,
                    userId: userId,
                    date: date,
                    recipeId: recipeId,
                    recipeTitle: recipeTitle,
                    createdAt: new Date().toISOString(),
                };
                this.mealPlans.set(mealPlanEntry.id, mealPlanEntry);
                return [2 /*return*/, mealPlanEntry];
            });
        });
    };
    MemoryStorage.prototype.removeRecipeFromMealPlan = function (userId, mealPlanEntryId) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                entry = this.mealPlans.get(mealPlanEntryId);
                if (entry && entry.userId === userId) {
                    this.mealPlans.delete(mealPlanEntryId);
                }
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.getMealPlanForDateRange = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var entries, groupedByDate, _i, entries_1, entry;
            return __generator(this, function (_a) {
                entries = Array.from(this.mealPlans.values()).filter(function (entry) {
                    return entry.userId === userId &&
                        entry.date >= startDate &&
                        entry.date <= endDate;
                });
                groupedByDate = {};
                for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    entry = entries_1[_i];
                    if (!groupedByDate[entry.date]) {
                        groupedByDate[entry.date] = [];
                    }
                    groupedByDate[entry.date].push(entry);
                }
                return [2 /*return*/, groupedByDate];
            });
        });
    };
    MemoryStorage.prototype.getMealPlanForDate = function (userId, date) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.mealPlans.values()).filter(function (entry) {
                        return entry.userId === userId && entry.date === date;
                    })];
            });
        });
    };
    // Custom grocery item operations
    MemoryStorage.prototype.createCustomGroceryItem = function (userId, item) {
        return __awaiter(this, void 0, void 0, function () {
            var itemId, now, groceryItem;
            return __generator(this, function (_a) {
                itemId = "grocery-".concat(this.groceryItemIdCounter++);
                now = new Date();
                groceryItem = {
                    id: itemId,
                    userId: userId,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    unit: item.unit,
                    createdAt: now,
                    updatedAt: now
                };
                this.customGroceryItems.set(itemId, groceryItem);
                return [2 /*return*/, groceryItem];
            });
        });
    };
    MemoryStorage.prototype.getUserCustomGroceryItems = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.customGroceryItems.values()).filter(function (item) { return item.userId === userId; })];
            });
        });
    };
    MemoryStorage.prototype.updateCustomGroceryItem = function (itemId, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated;
            return __generator(this, function (_a) {
                existing = this.customGroceryItems.get(itemId);
                if (!existing || existing.userId !== userId) {
                    throw new Error("Custom grocery item not found");
                }
                updated = __assign(__assign(__assign({}, existing), updates), { updatedAt: new Date() });
                this.customGroceryItems.set(itemId, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemoryStorage.prototype.deleteCustomGroceryItem = function (itemId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            return __generator(this, function (_a) {
                existing = this.customGroceryItems.get(itemId);
                if (!existing || existing.userId !== userId) {
                    throw new Error("Custom grocery item not found");
                }
                this.customGroceryItems.delete(itemId);
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.clearAllCustomGroceryItems = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, itemId, item;
            return __generator(this, function (_c) {
                for (_i = 0, _a = this.customGroceryItems; _i < _a.length; _i++) {
                    _b = _a[_i], itemId = _b[0], item = _b[1];
                    if (item.userId === userId) {
                        this.customGroceryItems.delete(itemId);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    MemoryStorage.prototype.saveGroceryList = function (userId, list) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.savedGroceryLists.set(userId, __assign(__assign({}, list), { updatedAt: new Date() }));
                return [2 /*return*/, this.savedGroceryLists.get(userId)];
            });
        });
    };
    MemoryStorage.prototype.getSavedGroceryList = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.savedGroceryLists.get(userId)];
            });
        });
    };
    MemoryStorage.prototype.updateGroceryListItem = function (userId, itemId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var savedList, itemIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        savedList = this.savedGroceryLists.get(userId);
                        if (!savedList) {
                            throw new Error("No saved grocery list found");
                        }
                        itemIndex = savedList.items.findIndex(function (item) { return item.id === itemId; });
                        if (itemIndex === -1) {
                            throw new Error("Item not found in grocery list");
                        }
                        savedList.items[itemIndex] = __assign(__assign({}, savedList.items[itemIndex]), updates);
                        return [4 /*yield*/, this.saveGroceryList(userId, savedList)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MemoryStorage.prototype.deleteSavedGroceryList = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.savedGroceryLists.delete(userId);
                return [2 /*return*/];
            });
        });
    };
    return MemoryStorage;
}());
exports.MemoryStorage = MemoryStorage;
