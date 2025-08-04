import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateRecipe, getChatResponse } from "./anthropic";
import { insertRecipeSchema, updateUserSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";

// Email configuration
const emailTransporter = nodemailer.createTransport({
  // Configure with your email service
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
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await dbStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = updateUserSchema.parse(req.body);
      const user = await dbStorage.updateUser(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete('/api/user/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // In a real app, you'd implement account deletion logic
      res.json({ message: "Account deletion requested" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Photo upload route
  app.post('/api/user/upload-photo', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const photoUrl = `/uploads/${req.file.filename}`;
      
      // Update user profile with new photo URL
      const user = await dbStorage.updateUser(userId, {
        profileImageUrl: photoUrl
      });

      res.json({ 
        message: "Photo uploaded successfully",
        profileImageUrl: photoUrl,
        user 
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Recipe routes
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const category = req.query.category as string;
      const recipes = await dbStorage.getRecipesByUser(userId, category);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.post('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeData = insertRecipeSchema.parse(req.body);
      const recipe = await dbStorage.createRecipe(userId, recipeData);
      res.json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.get('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeId = parseInt(req.params.id);
      const recipe = await dbStorage.getRecipe(recipeId, userId);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.patch('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeId = parseInt(req.params.id);
      const updates = insertRecipeSchema.partial().parse(req.body);
      const recipe = await dbStorage.updateRecipe(recipeId, userId, updates);
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeId = parseInt(req.params.id);
      await dbStorage.deleteRecipe(recipeId, userId);
      res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  app.get('/api/recipes/search/:query', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.params.query;
      const recipes = await dbStorage.searchRecipes(userId, query);
      res.json(recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  // AI Chatbot routes - no longer needed, using Express sessions

  app.post('/api/chatbot/generate-recipe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Check subscription limits
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const usage = await dbStorage.getUsageForMonth(userId, currentMonth);
      const user = await dbStorage.getUser(userId);
      
      const limits = {
        free: 5,
        basic: 50,
        pro: -1 // unlimited
      };
      
      const userLimit = limits[user?.subscriptionTier as keyof typeof limits] || 5;
      const currentUsage = usage?.recipeQueries || 0;
      
      if (userLimit !== -1 && currentUsage >= userLimit) {
        return res.status(403).json({ message: "Monthly recipe limit reached. Please upgrade your plan." });
      }

      // Get conversation context for better recipe generation
      const sessionId = req.sessionID;
      const conversation = await dbStorage.getChatConversation(userId, sessionId);
      const conversationContext = conversation?.messages ? 
        (conversation.messages as Array<{role: string, content: string}>) : [];

      const recipe = await generateRecipe(prompt, conversationContext);
      
      // Track usage
      await dbStorage.incrementUsage(userId, currentMonth, 'recipeQueries');
      
      // Create conversation record for recipe generation if needed
      const userMessage = { role: 'user', content: prompt };
      const recipeMessage = { 
        role: 'assistant', 
        content: `I've created a recipe for you: **${recipe.title}**. Would you like me to save it to your collection?`,
        recipe: recipe
      };
      
      // Update existing conversation or create new one with recipe
      let existingConversation = await dbStorage.getChatConversation(userId, sessionId);
      if (existingConversation) {
        const updatedMessages = [...(existingConversation.messages as any[]), userMessage, recipeMessage];
        await dbStorage.updateChatConversation(existingConversation.id, userId, updatedMessages);
      } else {
        await dbStorage.createChatConversation(userId, sessionId, { 
          sessionId,
          messages: [userMessage, recipeMessage] 
        });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ message: "Failed to generate recipe" });
    }
  });

  // Get user usage stats
  app.get('/api/usage/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const usage = await dbStorage.getUsageForMonth(userId, currentMonth);
      
      res.json({
        currentMonth,
        recipeQueries: usage?.recipeQueries || 0,
        recipesGenerated: usage?.recipesGenerated || 0
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  app.post('/api/chatbot/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messages } = req.body;
      
      if (!Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages must be an array" });
      }

      // Track chat usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      await dbStorage.incrementUsage(userId, currentMonth, 'recipeQueries');

      const response = await getChatResponse(messages);
      
      // Save conversation for current session
      const sessionId = req.sessionID;
      const newMessages = [...messages, { role: 'assistant', content: response }];
      
      // Try to update existing conversation for this session, or create new one
      const existingConversation = await dbStorage.getChatConversation(userId, sessionId);
      if (existingConversation) {
        await dbStorage.updateChatConversation(existingConversation.id, userId, newMessages);
      } else {
        await dbStorage.createChatConversation(userId, sessionId, { sessionId, messages: newMessages });
      }
      
      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  app.get('/api/chatbot/conversation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.sessionID;
      
      // Get all conversation history
      const allHistory = await dbStorage.getAllChatHistory(userId);
      const hasHistory = allHistory.length > 0;
      
      // If no history exists, create welcome message for current session
      if (!hasHistory) {
        const welcomeMessage = [{
          role: 'assistant',
          content: "Hi! I'm FlavorBot, your AI recipe assistant. I can help you find recipes based on ingredients, dietary preferences, cooking time, or cuisine type. What would you like to cook today?"
        }];
        
        await dbStorage.createChatConversation(userId, sessionId, { sessionId, messages: welcomeMessage });
        
        res.json({ messages: welcomeMessage });
      } else {
        res.json({ messages: allHistory });
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Recipe sharing routes
  app.post('/api/recipes/:id/share/email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeId = parseInt(req.params.id);
      const { email, message } = req.body;
      
      const recipe = await dbStorage.getRecipe(recipeId, userId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const emailContent = `
        <h2>${recipe.title}</h2>
        <p>${recipe.description}</p>
        
        <h3>Ingredients:</h3>
        <ul>
          ${(recipe.ingredients as string[]).map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        
        <h3>Instructions:</h3>
        <ol>
          ${(recipe.instructions as string[]).map(instruction => `<li>${instruction}</li>`).join('')}
        </ol>
        
        <p><strong>Cook Time:</strong> ${recipe.cookTime} minutes</p>
        <p><strong>Servings:</strong> ${recipe.servings}</p>
        
        ${message ? `<p><em>Personal message: ${message}</em></p>` : ''}
      `;

      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Recipe: ${recipe.title}`,
        html: emailContent,
      });

      res.json({ message: "Recipe shared via email successfully" });
    } catch (error) {
      console.error("Error sharing recipe via email:", error);
      res.status(500).json({ message: "Failed to share recipe via email" });
    }
  });

  app.post('/api/recipes/:id/share/sms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recipeId = parseInt(req.params.id);
      const { phoneNumber, message } = req.body;
      
      if (!twilioClient) {
        return res.status(500).json({ message: "SMS service not configured" });
      }
      
      const recipe = await dbStorage.getRecipe(recipeId, userId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const smsContent = `${recipe.title}\n\n${recipe.description}\n\nGet the full recipe at: ${process.env.REPLIT_DOMAINS?.split(',')[0]}/recipes/${recipeId}${message ? `\n\n${message}` : ''}`;

      await twilioClient.messages.create({
        body: smsContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      res.json({ message: "Recipe shared via SMS successfully" });
    } catch (error) {
      console.error("Error sharing recipe via SMS:", error);
      res.status(500).json({ message: "Failed to share recipe via SMS" });
    }
  });

  // Usage tracking route
  app.get('/api/usage/:month', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const month = req.params.month;
      const usage = await dbStorage.getUsageForMonth(userId, month);
      res.json(usage || { recipeQueries: 0, recipesGenerated: 0 });
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
