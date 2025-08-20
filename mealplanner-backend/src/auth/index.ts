import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { createId } from "@paralleldrive/cuid2";
// Removed connect-pg-simple import - now using DynamoDB sessions

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Authentication middleware
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export function setupEmailAuth(app: Express) {
  // Setup session management - NOTE: Backend repo uses in-memory sessions
  // For DynamoDB sessions, see main server/ directory implementation

  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    // store: sessionStore, // Using default in-memory store for backend repo
    name: 'mealplanner.sid', // Custom session name
    cookie: {
      httpOnly: true,
      secure: false, // Disable secure in development
      sameSite: 'lax', // Less restrictive for development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours instead of 1 week
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || user.authProvider !== 'email' || !user.password) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          // Check if email is verified
          if (!user.emailVerified) {
            return done(null, false, { message: 'Please verify your email before logging in' });
          }
          
          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(null, false);
    }
  });

  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Enhanced password validation
      if (password.length < 12) {
        return res.status(400).json({ message: "Password must be at least 12 characters long" });
      }
      
      // Check password complexity
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!(hasUppercase && hasLowercase && hasNumbers && hasSpecialChar)) {
        return res.status(400).json({ 
          message: "Password must contain uppercase, lowercase, numbers, and special characters" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const userId = createId();
      
      const user = await storage.upsertUser({
        id: userId,
        email,
        password: hashedPassword,
        authProvider: 'email',
        firstName,
        lastName,
        emailVerified: false,
      });

      // Generate email verification token
      const token = await storage.generateEmailVerificationToken(userId, email);
      
      // MOCK EMAIL SERVICE - Log verification details for development
      console.log(`\n=== EMAIL VERIFICATION (MOCK) ===`);
      console.log(`User: ${email}`);
      console.log(`Verification Token: ${token}`);
      console.log(`Verification URL: http://localhost:5000/verify-email?email=${encodeURIComponent(email)}&token=${token}`);
      console.log(`=====================================\n`);

      // Automatically log the user in after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return res.status(201).json({
            message: "Account created successfully. Check the console for verification details (mock email service).",
            email: user.email,
            requiresVerification: true,
            developmentMode: {
              verificationToken: token,
              verificationUrl: `/verify-email?email=${encodeURIComponent(email)}&token=${token}`
            }
          });
        }
        
        // Successfully logged in
        res.status(201).json({
          message: "Account created successfully and you're now logged in!",
          user: user,
          requiresVerification: true,
          developmentMode: {
            verificationToken: token,
            verificationUrl: `/verify-email?email=${encodeURIComponent(email)}&token=${token}`
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Email verification route
  app.post("/api/verify-email", async (req, res) => {
    try {
      const { email, token } = req.body;
      
      if (!email || !token) {
        return res.status(400).json({ message: "Email and token are required" });
      }

      const isValid = await storage.verifyEmailToken(email, token);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Mark email as verified
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUser(user.id, { emailVerified: true, emailVerificationToken: null });
      
      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({
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

  // Logout routes (both GET and POST for flexibility)
  const logoutHandler = (req: any, res: any, next: any) => {
    req.logout((err: any) => {
      if (err) return next(err);
      
      // For GET requests, redirect to home page
      if (req.method === 'GET') {
        res.redirect('/');
      } else {
        // For POST requests, return JSON
        res.json({ message: "Logged out successfully" });
      }
    });
  };

  app.post("/api/logout", logoutHandler);
  app.get("/api/logout", logoutHandler);
}