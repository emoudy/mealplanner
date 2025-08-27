"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMonitoring = securityMonitoring;
exports.httpsRedirect = httpsRedirect;
// Security middleware and monitoring
function securityMonitoring(req, res, next) {
    // Basic security logging
    if (process.env.NODE_ENV === 'production') {
        console.log("Security log: ".concat(req.method, " ").concat(req.url, " from ").concat(req.ip));
    }
    next();
}
function httpsRedirect(req, res, next) {
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        res.redirect("https://".concat(req.header('host')).concat(req.url));
    }
    else {
        next();
    }
}
