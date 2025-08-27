"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var express_1 = require("express");
var http_1 = require("http");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var nodemailer_1 = require("nodemailer");
// Import domains
var routes_js_1 = require("../domains/users/routes.js");
var routes_js_2 = require("../domains/recipes/routes.js");
var routes_js_3 = require("../domains/ai-chat/routes.js");
var routes_js_4 = require("../domains/meal-planning/routes.js");
var routes_js_5 = require("../domains/grocery/routes.js");
var routes_js_6 = require("../domains/notifications/routes.js");
// Import existing infrastructure
var storage_js_1 = require("../storage.js");
var auth_js_1 = require("../auth.js");
var anthropic_js_1 = require("../anthropic.js");
// For now, create temporary schemas - will be replaced with proper shared utils
var createRecipeSchema = { parse: function (data) { return data; } };
var updateUserSchema = { parse: function (data) { return data; } };
// Email configuration
var emailTransporter = nodemailer_1.default.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
// SMS configuration (using Twilio)
var twilioClient = process.env.TWILIO_ACCOUNT_SID ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
// File upload configuration
var uploadDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
var multerStorage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
var upload = (0, multer_1.default)({
    storage: multerStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (_req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
function registerRoutes(app) {
    // Setup email/password authentication
    (0, auth_js_1.setupEmailAuth)(app);
    // Serve uploaded files
    app.use('/uploads', express_1.default.static(uploadDir));
    // Prepare dependencies for domain routes
    var dependencies = {
        dbStorage: storage_js_1.storage,
        isAuthenticated: auth_js_1.isAuthenticated,
        createRecipeSchema: createRecipeSchema,
        updateUserSchema: updateUserSchema,
        upload: upload,
        emailTransporter: emailTransporter,
        twilioClient: twilioClient,
        generateRecipe: anthropic_js_1.generateRecipe,
        getChatResponse: anthropic_js_1.getChatResponse
    };
    // Register domain routes
    app.use('/api', (0, routes_js_1.createUserRoutes)(dependencies));
    app.use('/api/recipes', (0, routes_js_2.createRecipeRoutes)(dependencies));
    app.use('/api/chatbot', (0, routes_js_3.createAiChatRoutes)(dependencies));
    app.use('/api/meal-plan', (0, routes_js_4.createMealPlanningRoutes)(dependencies));
    app.use('/api/grocery-', (0, routes_js_5.createGroceryRoutes)(dependencies)); // Maps to /api/grocery-items, /api/grocery-saved-grocery-list
    app.use('/api', (0, routes_js_6.createNotificationRoutes)(dependencies));
    var httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
