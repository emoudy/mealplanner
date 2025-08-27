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
exports.createGroceryRoutes = createGroceryRoutes;
// Grocery domain routes extracted from lines 625-820 of routes.ts
var express_1 = require("express");
function createGroceryRoutes(dependencies) {
    var _this = this;
    var router = (0, express_1.Router)();
    var dbStorage = dependencies.dbStorage, isAuthenticated = dependencies.isAuthenticated;
    // Custom grocery item routes - Lines 625-739
    router.post('/items', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, _a, name_1, category, quantity, unit, item, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    _a = req.body, name_1 = _a.name, category = _a.category, quantity = _a.quantity, unit = _a.unit;
                    if (!name_1 || !category) {
                        return [2 /*return*/, res.status(400).json({ message: "Name and category are required" })];
                    }
                    return [4 /*yield*/, dbStorage.createCustomGroceryItem(userId, { name: name_1, category: category, quantity: quantity, unit: unit })];
                case 1:
                    item = _c.sent();
                    return [2 /*return*/, res.status(201).json(item)];
                case 2:
                    error_1 = _c.sent();
                    console.error("Error creating custom grocery item:", error_1);
                    return [2 /*return*/, res.status(500).json({ message: error_1.message || "Failed to create grocery item" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.get('/items', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, items, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    return [4 /*yield*/, dbStorage.getUserCustomGroceryItems(userId)];
                case 1:
                    items = _b.sent();
                    return [2 /*return*/, res.json(items)];
                case 2:
                    error_2 = _b.sent();
                    console.error("Error getting custom grocery items:", error_2);
                    return [2 /*return*/, res.status(500).json({ message: error_2.message || "Failed to get grocery items" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.put('/items/:id', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, itemId, _a, name_2, category, quantity, unit, item, error_3;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    itemId = req.params.id;
                    _a = req.body, name_2 = _a.name, category = _a.category, quantity = _a.quantity, unit = _a.unit;
                    return [4 /*yield*/, dbStorage.updateCustomGroceryItem(itemId, userId, { name: name_2, category: category, quantity: quantity, unit: unit })];
                case 1:
                    item = _c.sent();
                    return [2 /*return*/, res.json(item)];
                case 2:
                    error_3 = _c.sent();
                    console.error("Error updating custom grocery item:", error_3);
                    return [2 /*return*/, res.status(500).json({ message: error_3.message || "Failed to update grocery item" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.delete('/items/:id', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, itemId, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    itemId = req.params.id;
                    return [4 /*yield*/, dbStorage.deleteCustomGroceryItem(itemId, userId)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({ message: "Grocery item deleted" })];
                case 2:
                    error_4 = _b.sent();
                    console.error("Error deleting custom grocery item:", error_4);
                    return [2 /*return*/, res.status(500).json({ message: error_4.message || "Failed to delete grocery item" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.delete('/items', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, error_5;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    return [4 /*yield*/, dbStorage.clearAllCustomGroceryItems(userId)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(200).json({ message: "All custom grocery items cleared" })];
                case 2:
                    error_5 = _b.sent();
                    console.error("Error clearing custom grocery items:", error_5);
                    return [2 /*return*/, res.status(500).json({ message: error_5.message || "Failed to clear grocery items" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Saved grocery list routes - Lines 741-820
    router.post('/saved-grocery-list', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, _a, items, selectedRecipeIds, showCustomItems, savedList, result, error_6;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    _a = req.body, items = _a.items, selectedRecipeIds = _a.selectedRecipeIds, showCustomItems = _a.showCustomItems;
                    savedList = {
                        id: "saved-list-".concat(userId),
                        userId: userId,
                        items: items || [],
                        selectedRecipeIds: selectedRecipeIds || [],
                        showCustomItems: showCustomItems !== undefined ? showCustomItems : true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    return [4 /*yield*/, dbStorage.saveGroceryList(userId, savedList)];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, res.status(201).json(result)];
                case 2:
                    error_6 = _c.sent();
                    console.error("Error saving grocery list:", error_6);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to save grocery list" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.get('/saved-grocery-list', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, savedList, error_7;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    return [4 /*yield*/, dbStorage.getSavedGroceryList(userId)];
                case 1:
                    savedList = _b.sent();
                    if (!savedList) {
                        return [2 /*return*/, res.status(404).json({ message: "No saved grocery list found" })];
                    }
                    return [2 /*return*/, res.json(savedList)];
                case 2:
                    error_7 = _b.sent();
                    console.error("Error getting saved grocery list:", error_7);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to get saved grocery list" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.patch('/saved-grocery-list/:itemId', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, itemId, updates, error_8;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    itemId = req.params.itemId;
                    updates = req.body;
                    return [4 /*yield*/, dbStorage.updateGroceryListItem(userId, itemId, updates)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(204).send()];
                case 2:
                    error_8 = _b.sent();
                    console.error("Error updating grocery list item:", error_8);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to update grocery list item" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    router.delete('/saved-grocery-list', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, error_9;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                    }
                    return [4 /*yield*/, dbStorage.deleteSavedGroceryList(userId)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, res.status(204).send()];
                case 2:
                    error_9 = _b.sent();
                    console.error("Error deleting saved grocery list:", error_9);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to delete saved grocery list" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    return router;
}
