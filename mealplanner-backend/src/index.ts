import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import cors from "cors";
import { securityMonitoring, httpsRedirect } from "./security/index.js";

// Add process event listeners for debugging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately in development for debugging
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately in development for debugging
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }
});

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// HTTPS redirect in production
app.use(httpsRedirect);

// Security monitoring
app.use(securityMonitoring);

// Security middleware
app.use(helmet({
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
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') || ['https://your-domain.com']
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many login attempts, please try again later."
  },
  skipSuccessfulRequests: true,
});

// AI API rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    error: "AI rate limit exceeded, please try again later."
  },
});

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: process.env.NODE_ENV === 'development' ? 1000 : 2,
  delayMs: () => process.env.NODE_ENV === 'development' ? 0 : 500,
});

// Apply rate limiting to API routes
app.use('/api', globalLimiter);
app.use('/api', speedLimiter);

// Apply auth rate limiting to auth routes
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);

// Apply AI rate limiting to AI routes
app.use('/api/chatbot', aiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register API routes and setup the HTTP server
// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register routes
registerRoutes(app);

// Global error handler with security logging
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
const PORT = process.env.PORT || 5001; // Use different port for backend
const server = app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 MealPlanner Backend serving on port ${PORT}`);
});

// Add error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle uncaught exceptions and unhandled promises
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});