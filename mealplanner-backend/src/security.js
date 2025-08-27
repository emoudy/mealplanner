"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAccountLockout = checkAccountLockout;
exports.recordFailedLogin = recordFailedLogin;
exports.clearFailedLogins = clearFailedLogins;
exports.sanitizeInput = sanitizeInput;
exports.validatePrompt = validatePrompt;
exports.validateFileUpload = validateFileUpload;
exports.logSecurityEvent = logSecurityEvent;
exports.securityMonitoring = securityMonitoring;
exports.httpsRedirect = httpsRedirect;
var validator_1 = require("validator");
// Account lockout tracking (in production, use Redis)
var loginAttempts = new Map();
// Clean up old entries every hour
setInterval(function () {
    var now = Date.now();
    var entries = Array.from(loginAttempts.entries());
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var _a = entries_1[_i], key = _a[0], value = _a[1];
        if (value.lockoutUntil && value.lockoutUntil < now) {
            loginAttempts.delete(key);
        }
    }
}, 60 * 60 * 1000);
function checkAccountLockout(identifier) {
    var attempts = loginAttempts.get(identifier);
    if (!attempts)
        return false;
    if (attempts.lockoutUntil && attempts.lockoutUntil > Date.now()) {
        return true; // Account is locked
    }
    return false;
}
function recordFailedLogin(identifier) {
    var attempts = loginAttempts.get(identifier) || { attempts: 0 };
    attempts.attempts += 1;
    // Lock account after 5 failed attempts for 15 minutes
    if (attempts.attempts >= 5) {
        attempts.lockoutUntil = Date.now() + (15 * 60 * 1000);
        loginAttempts.set(identifier, attempts);
        return true; // Account is now locked
    }
    loginAttempts.set(identifier, attempts);
    return false; // Not locked yet
}
function clearFailedLogins(identifier) {
    loginAttempts.delete(identifier);
}
// Input sanitization middleware
function sanitizeInput(req, res, next) {
    function sanitizeObject(obj) {
        if (typeof obj === 'string') {
            return validator_1.default.escape(obj);
        }
        else if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        else if (obj && typeof obj === 'object') {
            var sanitized = {};
            for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                sanitized[key] = sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    }
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    next();
}
// AI prompt safety filter
function validatePrompt(prompt) {
    // Block attempts to extract system prompts
    var dangerousPatterns = [
        /ignore\s+previous\s+instructions/i,
        /system\s+prompt/i,
        /you\s+are\s+now/i,
        /forget\s+everything/i,
        /new\s+instructions/i,
        /admin\s+mode/i,
        /developer\s+mode/i,
        /jailbreak/i,
        /prompt\s+injection/i,
        /</,
        />/,
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
    ];
    for (var _i = 0, dangerousPatterns_1 = dangerousPatterns; _i < dangerousPatterns_1.length; _i++) {
        var pattern = dangerousPatterns_1[_i];
        if (pattern.test(prompt)) {
            return {
                isValid: false,
                reason: 'Prompt contains potentially harmful content'
            };
        }
    }
    // Check for excessively long prompts (potential DoS)
    if (prompt.length > 5000) {
        return {
            isValid: false,
            reason: 'Prompt exceeds maximum length'
        };
    }
    return { isValid: true };
}
// Enhanced file upload validation
function validateFileUpload(file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        return { isValid: false, reason: 'File size exceeds 5MB limit' };
    }
    // Validate MIME type
    var allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return { isValid: false, reason: 'Invalid file type' };
    }
    // Check file extension
    var allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    var fileExtension = file.originalname.toLowerCase().split('.').pop();
    if (!fileExtension || !allowedExtensions.includes(".".concat(fileExtension))) {
        return { isValid: false, reason: 'Invalid file extension' };
    }
    // Basic file header validation
    var jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF]);
    var pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
    var gifHeader = Buffer.from([0x47, 0x49, 0x46]);
    if (file.mimetype === 'image/jpeg' && !file.buffer.subarray(0, 3).equals(jpegHeader)) {
        return { isValid: false, reason: 'File header does not match JPEG format' };
    }
    if (file.mimetype === 'image/png' && !file.buffer.subarray(0, 4).equals(pngHeader)) {
        return { isValid: false, reason: 'File header does not match PNG format' };
    }
    return { isValid: true };
}
// Security logging
function logSecurityEvent(event, details, req) {
    var _a;
    var logData = {
        timestamp: new Date().toISOString(),
        event: event,
        details: details,
        ip: req === null || req === void 0 ? void 0 : req.ip,
        userAgent: req === null || req === void 0 ? void 0 : req.get('User-Agent'),
        userId: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id,
    };
    console.warn('[SECURITY EVENT]', JSON.stringify(logData));
    // In production, send to security monitoring service
    // Example: await sendToSecurityService(logData);
}
// Request monitoring middleware
function securityMonitoring(req, res, next) {
    var startTime = Date.now();
    // Log suspicious patterns
    var suspiciousPatterns = [
        /admin/i,
        /config/i,
        /debug/i,
        /test/i,
        /\.env/i,
        /password/i,
        /secret/i,
    ];
    var url = req.url ? req.url.toLowerCase() : '';
    var body = req.body ? JSON.stringify(req.body).toLowerCase() : '';
    for (var _i = 0, suspiciousPatterns_1 = suspiciousPatterns; _i < suspiciousPatterns_1.length; _i++) {
        var pattern = suspiciousPatterns_1[_i];
        if (pattern.test(url) || pattern.test(body)) {
            logSecurityEvent('suspicious_request', {
                url: req.url,
                method: req.method,
                body: req.body,
                reason: 'Suspicious pattern detected'
            }, req);
            break;
        }
    }
    // Monitor request duration for potential DoS
    res.on('finish', function () {
        var duration = Date.now() - startTime;
        if (duration > 30000) { // 30 seconds
            logSecurityEvent('slow_request', {
                url: req.url,
                method: req.method,
                duration: duration,
            }, req);
        }
    });
    next();
}
// HTTPS redirect middleware for production
function httpsRedirect(req, res, next) {
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect("https://".concat(req.get('host')).concat(req.url));
    }
    next();
}
