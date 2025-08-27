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
exports.createNotificationRoutes = createNotificationRoutes;
// Notifications domain routes extracted from lines 401-557 of routes.ts
var express_1 = require("express");
function createNotificationRoutes(dependencies) {
    var _this = this;
    var router = (0, express_1.Router)();
    var dbStorage = dependencies.dbStorage, isAuthenticated = dependencies.isAuthenticated, emailTransporter = dependencies.emailTransporter, twilioClient = dependencies.twilioClient;
    // Email verification routes - Lines 401-445
    router.post('/auth/send-verification', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, email, user, token, verificationUrl, emailContent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    userId = req.user.id;
                    email = req.user.claims.email;
                    if (!email) {
                        return [2 /*return*/, res.status(400).json({ message: "No email address found" })];
                    }
                    return [4 /*yield*/, dbStorage.getUser(userId)];
                case 1:
                    user = _a.sent();
                    if (user === null || user === void 0 ? void 0 : user.emailVerified) {
                        return [2 /*return*/, res.status(400).json({ message: "Email already verified" })];
                    }
                    // Check if email credentials are configured
                    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                        return [2 /*return*/, res.status(500).json({
                                message: "Email service not configured. Please contact support."
                            })];
                    }
                    return [4 /*yield*/, dbStorage.generateEmailVerificationToken(userId, email)];
                case 2:
                    token = _a.sent();
                    verificationUrl = "".concat(req.protocol, "://").concat(req.hostname, "/api/auth/verify-email?token=").concat(token, "&userId=").concat(userId);
                    emailContent = "\n        <h2>Welcome to MealPlanner!</h2>\n        <p>Please verify your email address to start using all MealPlanner features:</p>\n        <p><a href=\"".concat(verificationUrl, "\" style=\"background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;\">Verify Email Address</a></p>\n        <p>Or copy and paste this link: ").concat(verificationUrl, "</p>\n        <p>This link will expire in 24 hours.</p>\n      ");
                    return [4 /*yield*/, emailTransporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: "Verify your MealPlanner email address",
                            html: emailContent,
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, res.json({ message: "Verification email sent successfully" })];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error sending verification email:", error_1);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to send verification email" })];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    router.get('/auth/verify-email', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, token, userId, success, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = req.query, token = _a.token, userId = _a.userId;
                    if (!token || !userId) {
                        return [2 /*return*/, res.status(400).send("Invalid verification link")];
                    }
                    return [4 /*yield*/, dbStorage.verifyEmail(userId, token)];
                case 1:
                    success = _b.sent();
                    if (success) {
                        return [2 /*return*/, res.send("\n          <html>\n            <body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;\">\n              <h1 style=\"color: #10B981;\">Email Verified!</h1>\n              <p>Your email has been successfully verified. You can now close this window and enjoy all MealPlanner features!</p>\n              <a href=\"/\" style=\"background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;\">Return to MealPlanner</a>\n            </body>\n          </html>\n        ")];
                    }
                    else {
                        return [2 /*return*/, res.status(400).send("\n          <html>\n            <body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;\">\n              <h1 style=\"color: #EF4444;\">Verification Failed</h1>\n              <p>This verification link is invalid or has expired. Please request a new verification email.</p>\n              <a href=\"/\" style=\"background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;\">Return to MealPlanner</a>\n            </body>\n          </html>\n        ")];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.error("Error verifying email:", error_2);
                    return [2 /*return*/, res.status(500).send("Error verifying email")];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Recipe sharing routes - Lines 447-508
    router.post('/recipes/:id/share/email', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, user, recipeId, _a, email, message, recipe, emailContent, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    userId = req.user.id;
                    return [4 /*yield*/, dbStorage.getUser(userId)];
                case 1:
                    user = _b.sent();
                    // Check if user's email is verified
                    if (!(user === null || user === void 0 ? void 0 : user.emailVerified)) {
                        return [2 /*return*/, res.status(400).json({
                                message: "Please verify your email address before sharing recipes. Check your inbox for a verification email."
                            })];
                    }
                    // Check if email credentials are configured
                    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                        return [2 /*return*/, res.status(500).json({
                                message: "Email service not configured. Please contact support to enable email sharing."
                            })];
                    }
                    recipeId = parseInt(req.params.id);
                    _a = req.body, email = _a.email, message = _a.message;
                    return [4 /*yield*/, dbStorage.getRecipe(recipeId, userId)];
                case 2:
                    recipe = _b.sent();
                    if (!recipe) {
                        return [2 /*return*/, res.status(404).json({ message: "Recipe not found" })];
                    }
                    emailContent = "\n        <h2>".concat(recipe.title, "</h2>\n        <p>").concat(recipe.description, "</p>\n        \n        <h3>Ingredients:</h3>\n        <ul>\n          ").concat(recipe.ingredients.map(function (ingredient) { return "<li>".concat(ingredient, "</li>"); }).join(''), "\n        </ul>\n        \n        <h3>Instructions:</h3>\n        <ol>\n          ").concat(recipe.instructions.map(function (instruction) { return "<li>".concat(instruction, "</li>"); }).join(''), "\n        </ol>\n        \n        <p><strong>Cook Time:</strong> ").concat(recipe.cookTime, " minutes</p>\n        <p><strong>Servings:</strong> ").concat(recipe.servings, "</p>\n        \n        ").concat(message ? "<p><em>Personal message: ".concat(message, "</em></p>") : '', "\n      ");
                    return [4 /*yield*/, emailTransporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: "Recipe: ".concat(recipe.title),
                            html: emailContent,
                        })];
                case 3:
                    _b.sent();
                    return [2 /*return*/, res.json({ message: "Recipe shared via email successfully" })];
                case 4:
                    error_3 = _b.sent();
                    console.error("Error sharing recipe via email:", error_3);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to share recipe via email" })];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    router.post('/recipes/:id/share/sms', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, recipeId, _a, phoneNumber, message, recipe, smsContent, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    userId = req.user.id;
                    recipeId = parseInt(req.params.id);
                    _a = req.body, phoneNumber = _a.phoneNumber, message = _a.message;
                    if (!twilioClient) {
                        return [2 /*return*/, res.status(500).json({ message: "SMS service not configured" })];
                    }
                    return [4 /*yield*/, dbStorage.getRecipe(recipeId, userId)];
                case 1:
                    recipe = _b.sent();
                    if (!recipe) {
                        return [2 /*return*/, res.status(404).json({ message: "Recipe not found" })];
                    }
                    smsContent = "".concat(recipe.title, "\n\n").concat(recipe.description, "\n\nGet the full recipe at: ").concat(req.get('host'), "/recipes/").concat(recipeId).concat(message ? "\n\n".concat(message) : '');
                    return [4 /*yield*/, twilioClient.messages.create({
                            body: smsContent,
                            from: process.env.TWILIO_PHONE_NUMBER,
                            to: phoneNumber,
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, res.json({ message: "Recipe shared via SMS successfully" })];
                case 3:
                    error_4 = _b.sent();
                    console.error("Error sharing recipe via SMS:", error_4);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to share recipe via SMS" })];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Usage tracking route - Lines 510-520
    router.get('/usage/:month', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, month, usage, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.user.id;
                    month = req.params.month;
                    return [4 /*yield*/, dbStorage.getUsageForMonth(userId, month)];
                case 1:
                    usage = _a.sent();
                    return [2 /*return*/, res.json(usage || { recipeQueries: 0, recipesGenerated: 0 })];
                case 2:
                    error_5 = _a.sent();
                    console.error("Error fetching usage:", error_5);
                    return [2 /*return*/, res.status(500).json({ message: "Failed to fetch usage" })];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    return router;
}
