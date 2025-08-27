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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var index_js_1 = require("./routes/index.js");
var helmet_1 = require("helmet");
var express_rate_limit_1 = require("express-rate-limit");
var express_slow_down_1 = require("express-slow-down");
var cors_1 = require("cors");
var index_js_2 = require("./security/index.js");
var app = (0, express_1.default)();
// Trust proxy for rate limiting
app.set('trust proxy', 1);
// HTTPS redirect in production
app.use(index_js_2.httpsRedirect);
// Security monitoring
app.use(index_js_2.securityMonitoring);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ((_a = process.env.FRONTEND_URL) === null || _a === void 0 ? void 0 : _a.split(',')) || ['https://your-domain.com']
        : ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));
// Global rate limiting
var globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100,
    message: {
        error: "Too many requests from this IP, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Auth specific rate limiting
var authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        error: "Too many login attempts, please try again later."
    },
    skipSuccessfulRequests: true,
});
// AI API rate limiting
var aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    message: {
        error: "AI rate limit exceeded, please try again later."
    },
});
// Slow down repeated requests
var speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: process.env.NODE_ENV === 'development' ? 1000 : 2,
    delayMs: function () { return process.env.NODE_ENV === 'development' ? 0 : 500; },
});
// Apply rate limiting to API routes
app.use('/api', globalLimiter);
app.use('/api', speedLimiter);
// Apply auth rate limiting to auth routes
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);
// Apply AI rate limiting to AI routes
app.use('/api/chatbot', aiLimiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Register API routes and setup the HTTP server
var server = (0, index_js_1.registerRoutes)(app);
// Global error handler with security logging
app.use(function (err, req, res, next) {
    console.error('Global error:', {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    res.status(500).json(__assign({ message: "Internal server error" }, (process.env.NODE_ENV === 'development' && { error: err.message })));
});
// Health check endpoint
app.get('/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Start server
var PORT = process.env.PORT || 5001; // Use different port for backend
server.listen(PORT, "0.0.0.0", function () {
    console.log("\uD83D\uDE80 MealPlanner Backend serving on port ".concat(PORT));
});
