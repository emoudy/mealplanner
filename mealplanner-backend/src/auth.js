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
exports.isAuthenticated = void 0;
exports.setupEmailAuth = setupEmailAuth;
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var express_session_1 = require("express-session");
var crypto_1 = require("crypto");
var util_1 = require("util");
var storage_1 = require("./storage");
var session_dynamodb_js_1 = require("./session-dynamodb.js");
// Temporary comment out the shared import until we set it up properly  
// import { UserData as SelectUser } from "@mealplanner/shared/utils/schemas";
var cuid2_1 = require("@paralleldrive/cuid2");
var scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = (0, crypto_1.randomBytes)(16).toString("hex");
                    return [4 /*yield*/, scryptAsync(password, salt, 64)];
                case 1:
                    buf = (_a.sent());
                    return [2 /*return*/, "".concat(buf.toString("hex"), ".").concat(salt)];
            }
        });
    });
}
function comparePasswords(supplied, stored) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hashed, salt, hashedBuf, suppliedBuf;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = stored.split("."), hashed = _a[0], salt = _a[1];
                    hashedBuf = Buffer.from(hashed, "hex");
                    return [4 /*yield*/, scryptAsync(supplied, salt, 64)];
                case 1:
                    suppliedBuf = (_b.sent());
                    return [2 /*return*/, (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf)];
            }
        });
    });
}
// Authentication middleware
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
};
exports.isAuthenticated = isAuthenticated;
function setupEmailAuth(app) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionStore, hasAWSCredentials, memorystore, MemoryStore, logoutHandler;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hasAWSCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
                    if (!hasAWSCredentials) return [3 /*break*/, 1];
                    sessionStore = new session_dynamodb_js_1.DynamoDBSessionStore();
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, Promise.resolve().then(function () { return require('memorystore'); })];
                case 2:
                    memorystore = _a.sent();
                    MemoryStore = memorystore.default(express_session_1.default);
                    sessionStore = new MemoryStore({
                        checkPeriod: 86400000 // Prune expired entries every 24h
                    });
                    _a.label = 3;
                case 3:
                    app.use((0, express_session_1.default)({
                        secret: process.env.SESSION_SECRET || 'fallback-secret-key',
                        resave: false,
                        saveUninitialized: false,
                        store: sessionStore,
                        name: 'mealplanner.sid', // Custom session name
                        cookie: {
                            httpOnly: true,
                            secure: false, // Disable secure in development
                            sameSite: 'lax', // Less restrictive for development
                            maxAge: 24 * 60 * 60 * 1000, // 24 hours instead of 1 week
                        },
                    }));
                    app.use(passport_1.default.initialize());
                    app.use(passport_1.default.session());
                    passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email' }, function (email, password, done) { return __awaiter(_this, void 0, void 0, function () {
                        var user, isValid, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                                case 1:
                                    user = _a.sent();
                                    if (!user || user.authProvider !== 'email' || !user.password) {
                                        return [2 /*return*/, done(null, false, { message: 'Invalid email or password' })];
                                    }
                                    // Check if email is verified
                                    if (!user.emailVerified) {
                                        return [2 /*return*/, done(null, false, { message: 'Please verify your email before logging in' })];
                                    }
                                    return [4 /*yield*/, comparePasswords(password, user.password)];
                                case 2:
                                    isValid = _a.sent();
                                    if (!isValid) {
                                        return [2 /*return*/, done(null, false, { message: 'Invalid email or password' })];
                                    }
                                    return [2 /*return*/, done(null, user)];
                                case 3:
                                    error_1 = _a.sent();
                                    return [2 /*return*/, done(error_1)];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }));
                    passport_1.default.serializeUser(function (user, done) { return done(null, user.id); });
                    passport_1.default.deserializeUser(function (id, done) { return __awaiter(_this, void 0, void 0, function () {
                        var user, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, storage_1.storage.getUser(id)];
                                case 1:
                                    user = _a.sent();
                                    if (!user) {
                                        return [2 /*return*/, done(null, false)];
                                    }
                                    done(null, user);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    console.error("Error deserializing user:", error_2);
                                    done(null, false);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Register route
                    app.post("/api/register", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, email_1, password, firstName, lastName, hasUppercase, hasLowercase, hasNumbers, hasSpecialChar, existingUser, hashedPassword, userId, user_1, token_1, error_3;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 5, , 6]);
                                    _a = req.body, email_1 = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName;
                                    // Validate input
                                    if (!email_1 || !password || !firstName || !lastName) {
                                        return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                                    }
                                    // Enhanced password validation
                                    if (password.length < 12) {
                                        return [2 /*return*/, res.status(400).json({ message: "Password must be at least 12 characters long" })];
                                    }
                                    hasUppercase = /[A-Z]/.test(password);
                                    hasLowercase = /[a-z]/.test(password);
                                    hasNumbers = /\d/.test(password);
                                    hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                                    if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecialChar)) {
                                        return [2 /*return*/, res.status(400).json({
                                                message: "Password must contain uppercase, lowercase, numbers, and special characters"
                                            })];
                                    }
                                    return [4 /*yield*/, storage_1.storage.getUserByEmail(email_1)];
                                case 1:
                                    existingUser = _b.sent();
                                    if (existingUser) {
                                        return [2 /*return*/, res.status(400).json({ message: "An account with this email already exists" })];
                                    }
                                    return [4 /*yield*/, hashPassword(password)];
                                case 2:
                                    hashedPassword = _b.sent();
                                    userId = (0, cuid2_1.createId)();
                                    return [4 /*yield*/, storage_1.storage.upsertUser({
                                            id: userId,
                                            email: email_1,
                                            password: hashedPassword,
                                            authProvider: 'email',
                                            firstName: firstName,
                                            lastName: lastName,
                                            emailVerified: false,
                                        })];
                                case 3:
                                    user_1 = _b.sent();
                                    return [4 /*yield*/, storage_1.storage.generateEmailVerificationToken(userId, email_1)];
                                case 4:
                                    token_1 = _b.sent();
                                    // MOCK EMAIL SERVICE - Log verification details for development
                                    console.log("\n=== EMAIL VERIFICATION (MOCK) ===");
                                    console.log("User: ".concat(email_1));
                                    console.log("Verification Token: ".concat(token_1));
                                    console.log("Verification URL: http://localhost:5000/verify-email?email=".concat(encodeURIComponent(email_1), "&token=").concat(token_1));
                                    console.log("=====================================\n");
                                    // Automatically log the user in after registration
                                    req.login(user_1, function (err) {
                                        if (err) {
                                            console.error("Auto-login error:", err);
                                            return res.status(201).json({
                                                message: "Account created successfully. Check the console for verification details (mock email service).",
                                                email: user_1.email,
                                                requiresVerification: true,
                                                developmentMode: {
                                                    verificationToken: token_1,
                                                    verificationUrl: "/verify-email?email=".concat(encodeURIComponent(email_1), "&token=").concat(token_1)
                                                }
                                            });
                                        }
                                        // Successfully logged in
                                        return res.status(201).json({
                                            message: "Account created successfully and you're now logged in!",
                                            user: user_1,
                                            requiresVerification: true,
                                            developmentMode: {
                                                verificationToken: token_1,
                                                verificationUrl: "/verify-email?email=".concat(encodeURIComponent(email_1), "&token=").concat(token_1)
                                            }
                                        });
                                    });
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_3 = _b.sent();
                                    console.error("Registration error:", error_3);
                                    return [2 /*return*/, res.status(500).json({ message: "Registration failed" })];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Email verification route
                    app.post("/api/verify-email", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, email, token, isValid, user, error_4;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 4, , 5]);
                                    _a = req.body, email = _a.email, token = _a.token;
                                    if (!email || !token) {
                                        return [2 /*return*/, res.status(400).json({ message: "Email and token are required" })];
                                    }
                                    return [4 /*yield*/, storage_1.storage.verifyEmailToken(email, token)];
                                case 1:
                                    isValid = _b.sent();
                                    if (!isValid) {
                                        return [2 /*return*/, res.status(400).json({ message: "Invalid or expired verification token" })];
                                    }
                                    return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                                case 2:
                                    user = _b.sent();
                                    if (!user) {
                                        return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                                    }
                                    return [4 /*yield*/, storage_1.storage.updateUser(user.id, { emailVerified: true, emailVerificationToken: null })];
                                case 3:
                                    _b.sent();
                                    return [2 /*return*/, res.json({ message: "Email verified successfully. You can now log in." })];
                                case 4:
                                    error_4 = _b.sent();
                                    console.error("Email verification error:", error_4);
                                    return [2 /*return*/, res.status(500).json({ message: "Email verification failed" })];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Login route
                    app.post("/api/login", function (req, res, next) {
                        passport_1.default.authenticate("local", function (err, user, info) {
                            if (err) {
                                return res.status(500).json({ message: "Login failed" });
                            }
                            if (!user) {
                                return res.status(401).json({ message: (info === null || info === void 0 ? void 0 : info.message) || "Invalid credentials" });
                            }
                            req.login(user, function (err) {
                                if (err) {
                                    return res.status(500).json({ message: "Login failed" });
                                }
                                return res.json({
                                    id: user.id,
                                    email: user.email,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    emailVerified: user.emailVerified,
                                    authProvider: user.authProvider,
                                });
                            });
                        })(req, res, next);
                    });
                    logoutHandler = function (req, res, next) {
                        req.logout(function (err) {
                            if (err)
                                return next(err);
                            // For GET requests, redirect to home page
                            if (req.method === 'GET') {
                                res.redirect('/');
                            }
                            else {
                                // For POST requests, return JSON
                                res.json({ message: "Logged out successfully" });
                            }
                        });
                    };
                    app.post("/api/logout", logoutHandler);
                    app.get("/api/logout", logoutHandler);
                    return [2 /*return*/];
            }
        });
    });
}
