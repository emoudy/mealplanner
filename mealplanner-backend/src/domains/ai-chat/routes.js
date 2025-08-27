"use strict";
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
exports.createAiChatRoutes = createAiChatRoutes;
// AI/Chat domain routes extracted from lines 223-389 of routes.ts
var express_1 = require("express");
function createAiChatRoutes(dependencies) {
    var _this = this;
    var router = (0, express_1.Router)();
    var dbStorage = dependencies.dbStorage, isAuthenticated = dependencies.isAuthenticated, generateRecipe = dependencies.generateRecipe, getChatResponse = dependencies.getChatResponse;
    // Generate recipe with AI - Lines 223-270
    router.post('/generate-recipe', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, prompt_1, currentMonth, usage, user, limits, userLimit, currentUsage, conversationContext, recipe, userMessage, recipeMessage, currentMessages, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    userId = req.user.id;
                    prompt_1 = req.body.prompt;
                    if (!prompt_1) {
                        return [2 /*return*/, res.status(400).json({ message: "Prompt is required" })];
                    }
                    currentMonth = new Date().toISOString().slice(0, 7);
                    return [4 /*yield*/, dbStorage.getUsageForMonth(userId, currentMonth)];
                case 1:
                    usage = _a.sent();
                    return [4 /*yield*/, dbStorage.getUser(userId)];
                case 2:
                    user = _a.sent();
                    limits = {
                        free: 5,
                        basic: 50,
                        pro: -1 // unlimited
                    };
                    userLimit = limits[user === null || user === void 0 ? void 0 : user.subscriptionTier] || 5;
                    currentUsage = (usage === null || usage === void 0 ? void 0 : usage.recipeQueries) || 0;
                    if (userLimit !== -1 && currentUsage >= userLimit) {
                        return [2 /*return*/, res.status(403).json({ message: "Monthly recipe limit reached. Please upgrade your plan." })];
                    }
                    conversationContext = req.session.chatMessages ?
                        req.session.chatMessages : [];
                    return [4 /*yield*/, generateRecipe(prompt_1, conversationContext)];
                case 3:
                    recipe = _a.sent();
                    // Track usage
                    return [4 /*yield*/, dbStorage.incrementUsage(userId, currentMonth, 'recipeQueries')];
                case 4:
                    // Track usage
                    _a.sent();
                    userMessage = { role: 'user', content: prompt_1 };
                    recipeMessage = {
                        role: 'assistant',
                        content: "I've created a recipe for you: **".concat(recipe.title, "**. Would you like me to save it to your collection?"),
                        recipe: recipe
                    };
                    currentMessages = req.session.chatMessages || [];
                    req.session.chatMessages = __spreadArray(__spreadArray([], currentMessages, true), [userMessage, recipeMessage], false);
                    return [2 /*return*/, res.json(recipe)];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error generating recipe:", error_1);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to generate recipe" })];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    // Get user usage stats - Lines 272-285
    router.get('/usage/stats', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, currentMonth, usage, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.user.id;
                    currentMonth = new Date().toISOString().slice(0, 7);
                    return [4 /*yield*/, dbStorage.getUsageForMonth(userId, currentMonth)];
                case 1:
                    usage = _a.sent();
                    res.json({
                        currentMonth: currentMonth,
                        recipeQueries: (usage === null || usage === void 0 ? void 0 : usage.recipeQueries) || 0,
                        recipesGenerated: (usage === null || usage === void 0 ? void 0 : usage.recipesGenerated) || 0
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error fetching usage stats:", error_2);
                    res.status(500).json({ message: "Failed to fetch usage stats" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Chat with AI - Lines 287-347
    router.post('/chat', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, messages, currentMonth, response, formattedResponse, extractSuggestions, dynamicSuggestions, newMessages, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    userId = req.user.id;
                    messages = req.body.messages;
                    if (!Array.isArray(messages)) {
                        return [2 /*return*/, res.status(400).json({ message: "Messages must be an array" })];
                    }
                    currentMonth = new Date().toISOString().slice(0, 7);
                    return [4 /*yield*/, dbStorage.incrementUsage(userId, currentMonth, 'recipeQueries')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, getChatResponse(messages)];
                case 2:
                    response = _a.sent();
                    formattedResponse = response
                        .replace(/• /g, '- ') // Convert bullet characters to markdown hyphens
                        .replace(/•\s/g, '- ');
                    extractSuggestions = function (content) {
                        var suggestions = [];
                        var listPattern = /^[\s]*[•\-]\s*(.+)$/gm;
                        var match;
                        while ((match = listPattern.exec(content)) !== null) {
                            var suggestion = match[1].trim();
                            suggestion = suggestion.replace(/\*\*/g, '');
                            // Simplified filtering - only exclude obvious non-recipe items
                            if (suggestion.length > 5 && suggestion.length < 100 &&
                                !suggestion.toLowerCase().includes('what i can help') &&
                                !suggestion.toLowerCase().includes('speaking of food') &&
                                !suggestion.toLowerCase().includes('help you with:') &&
                                !suggestion.toLowerCase().includes('today?') &&
                                !suggestion.toLowerCase().includes('right now?') &&
                                !suggestion.toLowerCase().startsWith('what ') &&
                                !suggestion.toLowerCase().startsWith('speaking ')) {
                                suggestions.push(suggestion);
                            }
                        }
                        // Also look for bold items like "**Item name**" (recipe titles)
                        var boldPattern = /\*\*([^*]+)\*\*/g;
                        while ((match = boldPattern.exec(content)) !== null) {
                            var suggestion = match[1].trim();
                            if (suggestion.length > 3 && suggestion.length < 50 &&
                                !suggestion.toLowerCase().includes('quick') &&
                                !suggestion.toLowerCase().includes('minutes') &&
                                !suggestion.toLowerCase().includes('options') &&
                                !suggestion.toLowerCase().includes('ideas') &&
                                !suggestion.toLowerCase().includes('grab-and-go') &&
                                !suggestion.toLowerCase().includes('protein-packed') &&
                                !suggestion.toLowerCase().includes('energy-boosting')) {
                                suggestions.push(suggestion);
                            }
                        }
                        return Array.from(new Set(suggestions)).slice(0, 12); // Support up to 12 suggestions
                    };
                    dynamicSuggestions = extractSuggestions(formattedResponse);
                    newMessages = __spreadArray(__spreadArray([], messages, true), [{ role: 'assistant', content: formattedResponse }], false);
                    req.session.chatMessages = newMessages;
                    req.session.dynamicSuggestions = dynamicSuggestions;
                    return [2 /*return*/, res.json({ response: formattedResponse, suggestions: dynamicSuggestions })];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error in chat:", error_3);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to get chat response" })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Get conversation history - Lines 349-389
    router.get('/conversation', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var sessionMessages, welcomeMessage, suggestions;
        return __generator(this, function (_a) {
            try {
                sessionMessages = req.session.chatMessages;
                // If no session messages exist, return welcome message
                if (!sessionMessages || !Array.isArray(sessionMessages) || sessionMessages.length === 0) {
                    welcomeMessage = [{
                            role: 'assistant',
                            content: "Hi! I'm MealPlanner, your AI recipe assistant. I can help you find recipes based on ingredients, dietary preferences, cooking time, or cuisine type. What would you like to cook today?"
                        }];
                    // Store welcome message in session
                    req.session.chatMessages = welcomeMessage;
                    req.session.dynamicSuggestions = [];
                    res.json({ messages: welcomeMessage, suggestions: [] });
                }
                else {
                    suggestions = req.session.dynamicSuggestions || [];
                    res.json({ messages: sessionMessages, suggestions: suggestions });
                }
            }
            catch (error) {
                console.error("Error fetching conversation:", error);
                res.status(500).json({ message: "Failed to fetch conversation" });
            }
            return [2 /*return*/];
        });
    }); });
    return router;
}
