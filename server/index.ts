import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createDynamoDBTable } from "./setup-dynamodb";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import cors from "cors";
import { securityMonitoring, httpsRedirect } from "./security";

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// HTTPS redirect in production
app.use(httpsRedirect);

// Security monitoring
app.use(securityMonitoring);

// Security middleware (relaxed CSP for development)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for production
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"], // Allow WebSocket for Vite HMR
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
    ? ['https://your-domain.com'] // Replace with actual domain
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));

// Global rate limiting (more permissive for development)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in development
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static assets in development
    return process.env.NODE_ENV === 'development' && 
           (req.url.includes('/@vite/') || req.url.includes('/src/') || req.url.includes('.js') || req.url.includes('.css'));
  }
});

// Auth specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many login attempts, please try again later."
  },
  skipSuccessfulRequests: true,
});

// AI API rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 AI requests per hour
  message: {
    error: "AI rate limit exceeded, please try again later."
  },
});

// Slow down repeated requests (disabled in development)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: process.env.NODE_ENV === 'development' ? 1000 : 2, // Higher threshold in development
  delayMs: () => process.env.NODE_ENV === 'development' ? 0 : 500, // No delay in development
  skip: (req) => {
    // Skip for static assets in development
    return process.env.NODE_ENV === 'development' && 
           (req.url.includes('/@vite/') || req.url.includes('/src/') || req.url.includes('.js') || req.url.includes('.css'));
  }
});

// Only apply rate limiting to API routes to avoid blocking static assets
app.use('/api', globalLimiter);
app.use('/api', speedLimiter);

// Apply auth rate limiting to auth routes
app.use('/api/register', authLimiter);
app.use('/api/login', authLimiter);

// Apply AI rate limiting to AI routes
app.use('/api/chatbot', aiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize DynamoDB table on startup (only if AWS credentials are available)
  const hasAWSCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  
  if (hasAWSCredentials) {
    try {
      await createDynamoDBTable();
      console.log("DynamoDB initialization complete");
    } catch (error) {
      console.error("DynamoDB initialization failed:", error);
      console.log("Falling back to in-memory storage");
    }
  } else {
    console.log("No AWS credentials found - using in-memory storage for development");
  }

  const server = await registerRoutes(app);

  // Setup periodic cleanup of expired sessions (every 24 hours)
  setInterval(() => {
    try {
      // Session cleanup is handled by DynamoDB session store automatically
      log("Session cleanup triggered");
    } catch (error) {
      console.error("Error during session cleanup:", error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
