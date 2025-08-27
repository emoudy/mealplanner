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
exports.createUserRoutes = createUserRoutes;
// User domain routes extracted from lines 67-135 of routes.ts
var express_1 = require("express");
function createUserRoutes(dependencies) {
    var _this = this;
    var router = (0, express_1.Router)();
    var dbStorage = dependencies.dbStorage, isAuthenticated = dependencies.isAuthenticated, updateUserSchema = dependencies.updateUserSchema, upload = dependencies.upload;
    // Universal user endpoint - Lines 67-75
    router.get('/auth/user', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            try {
                user = req.user;
                res.json(user);
            }
            catch (error) {
                console.error("Error fetching user:", error);
                res.status(500).json({ message: "Failed to fetch user" });
            }
            return [2 /*return*/];
        });
    }); });
    // User endpoint - Lines 79-88
    router.get('/user', function (req, res) {
        var _a, _b;
        console.log("User endpoint called, session:", (_a = req.session) === null || _a === void 0 ? void 0 : _a.id, "authenticated:", req.isAuthenticated(), "user:", (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        return res.json({
            id: req.user.id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            emailVerified: req.user.emailVerified,
            authProvider: req.user.authProvider,
        });
    });
    // User profile update - Lines 89-98
    router.patch('/user/profile', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, updates, user, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.user.id;
                    updates = updateUserSchema.parse(req.body);
                    return [4 /*yield*/, dbStorage.updateUser(userId, updates)];
                case 1:
                    user = _a.sent();
                    res.json(user);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error updating user:", error_1);
                    res.status(500).json({ message: "Failed to update profile" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Account deletion - Lines 103-111
    router.delete('/user/account', isAuthenticated, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // In a real app, you'd implement account deletion logic
                return [2 /*return*/, res.json({ message: "Account deletion requested" })];
            }
            catch (error) {
                console.error("Error deleting account:", error);
                return [2 /*return*/, res.status(500).json({ message: "Failed to delete account" })];
            }
            return [2 /*return*/];
        });
    }); });
    // Photo upload - Lines 113-135
    router.post('/user/upload-photo', isAuthenticated, upload.single('photo'), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, photoUrl, user, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.file) {
                        return [2 /*return*/, res.status(400).json({ message: "No file uploaded" })];
                    }
                    userId = req.user.id;
                    photoUrl = "/uploads/".concat(req.file.filename);
                    return [4 /*yield*/, dbStorage.updateUser(userId, {
                            profileImageUrl: photoUrl
                        })];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, res.json({
                            message: "Photo uploaded successfully",
                            profileImageUrl: photoUrl,
                            user: user
                        })];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error uploading photo:", error_2);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to upload photo" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    return router;
}
