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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMealPlanningRoutes = createMealPlanningRoutes;
// Meal planning domain routes extracted from lines 559-646 of routes.ts
var express_1 = require("express");
function createMealPlanningRoutes(dependencies) {
    var _this = this;
    var router = (0, express_1.Router)();
    var dbStorage = dependencies.dbStorage, isAuthenticated = dependencies.isAuthenticated;
    // Get meal plan - Lines 559-580
    router.get('/', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, _a, startDate, endDate, date, entries, mealPlan, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    _a = req.query, startDate = _a.startDate, endDate = _a.endDate, date = _a.date;
                    if (!date) return [3 /*break*/, 2];
                    return [4 /*yield*/, dbStorage.getMealPlanForDate(userId, date)];
                case 1:
                    entries = _c.sent();
                    return [2 /*return*/, res.json(entries)];
                case 2:
                    if (!(startDate && endDate)) return [3 /*break*/, 4];
                    return [4 /*yield*/, dbStorage.getMealPlanForDateRange(userId, startDate, endDate)];
                case 3:
                    mealPlan = _c.sent();
                    return [2 /*return*/, res.json(mealPlan)];
                case 4: return [2 /*return*/, res.status(400).json({ message: "Please provide either 'date' or both 'startDate' and 'endDate'" })];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    console.error("Error getting meal plan:", error_1);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to get meal plan" })];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    // Add recipe to meal plan - Lines 582-604
    router.post('/', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, _a, date, recipeId, recipeTitle, entry, error_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    _a = req.body, date = _a.date, recipeId = _a.recipeId, recipeTitle = _a.recipeTitle;
                    if (!date || !recipeId || !recipeTitle) {
                        return [2 /*return*/, res.status(400).json({ message: "Date, recipeId, and recipeTitle are required" })];
                    }
                    return [4 /*yield*/, dbStorage.addRecipeToMealPlan(userId, date, recipeId, recipeTitle)];
                case 1:
                    entry = _c.sent();
                    return [2 /*return*/, res.status(201).json(entry)];
                case 2:
                    error_2 = _c.sent();
                    console.error("Error adding recipe to meal plan:", error_2);
                    if (error_2 instanceof Error && error_2.message.includes("Cannot add more than 10 recipes")) {
                        return [2 /*return*/, res.status(400).json({ message: error_2.message })];
                    }
                    else {
                        return [2 /*return*/, res.status(500).json({ message: "Failed to add recipe to meal plan" })];
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Remove recipe from meal plan - Lines 606-623
    router.delete('/:entryId', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, entryId, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    entryId = parseInt(req.params.entryId);
                    if (isNaN(entryId)) {
                        return [2 /*return*/, res.status(400).json({ message: "Invalid entry ID" })];
                    }
                    return [4 /*yield*/, dbStorage.removeRecipeFromMealPlan(userId, entryId)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(204).send()];
                case 2:
                    error_3 = _b.sent();
                    console.error("Error removing recipe from meal plan:", error_3);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to remove recipe from meal plan" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    return router;
}
