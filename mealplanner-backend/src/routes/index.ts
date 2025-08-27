import type { Express } from "express";
import express from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import * as nodemailer from "nodemailer";

// Import domains
import { createUserRoutes } from '../domains/users/routes.js';
import { createRecipeRoutes } from '../domains/recipes/routes.js';
import { createAiChatRoutes } from '../domains/ai-chat/routes.js';
import { createMealPlanningRoutes } from '../domains/meal-planning/routes.js';
import { createGroceryRoutes } from '../domains/grocery/routes.js';
import { createNotificationRoutes } from '../domains/notifications/routes.js';

// Import existing infrastructure
import { storage as dbStorage } from "../storage.js";
import { setupEmailAuth, isAuthenticated } from "../auth.js";
import { generateRecipe, getChatResponse } from "../anthropic.js";

// For now, create temporary schemas - will be replaced with proper shared utils
const createRecipeSchema = { parse: (data: any) => data };
const updateUserSchema = { parse: (data: any) => data };

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// SMS configuration (using Twilio)
const twilioClient = process.env.TWILIO_ACCOUNT_SID ? require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
) : null;

// File upload configuration
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export function registerRoutes(app: Express): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup auth
  setupEmailAuth(app);

  // Create dependencies object to inject into domain routes
  const dependencies = {
    dbStorage,
    isAuthenticated,
    createRecipeSchema,
    updateUserSchema,
    upload,
    emailTransporter,
    twilioClient,
    generateRecipe,
    getChatResponse
  };

    // Register domain routes
  try {
    console.log('Registering user routes...');
    app.use('/api', createUserRoutes(dependencies));
    console.log('User routes registered successfully');
    
    console.log('Registering recipe routes...');
    app.use('/api/recipes', createRecipeRoutes(dependencies));
    console.log('Recipe routes registered successfully');
    
    console.log('Registering other domain routes...');
    app.use('/api/chatbot', createAiChatRoutes(dependencies));
    app.use('/api/meal-plan', createMealPlanningRoutes(dependencies));
    app.use('/api/grocery-', createGroceryRoutes(dependencies)); // Maps to /api/grocery-items, /api/grocery-saved-grocery-list
    app.use('/api', createNotificationRoutes(dependencies));
    console.log('All domain routes registered successfully');
  } catch (error) {
    console.error('Error registering routes:', error);
  }
}
