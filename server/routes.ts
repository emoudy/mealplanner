import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateRecipe, getChatResponse } from "./openai";
import { insertRecipeSchema, updateUserSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
      const user = await storage.updateUser(userId, updates);
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

  // Recipe routes
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const category = req.query.category as string;
      const recipes = await storage.getRecipesByUser(userId, category);
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
      const recipe = await storage.createRecipe(userId, recipeData);
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
      const recipe = await storage.getRecipe(recipeId, userId);
      
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
      const recipe = await storage.updateRecipe(recipeId, userId, updates);
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
      await storage.deleteRecipe(recipeId, userId);
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
      const recipes = await storage.searchRecipes(userId, query);
      res.json(recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  // AI Chatbot routes
  app.post('/api/chatbot/generate-recipe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Check subscription limits
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const usage = await storage.getUsageForMonth(userId, currentMonth);
      const user = await storage.getUser(userId);
      
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

      const recipe = await generateRecipe(prompt);
      
      // Track usage
      await storage.incrementUsage(userId, currentMonth, 'recipeQueries');
      
      res.json(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ message: "Failed to generate recipe" });
    }
  });

  app.post('/api/chatbot/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messages } = req.body;
      
      if (!Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages must be an array" });
      }

      const response = await getChatResponse(messages);
      
      // Save or update conversation
      let conversation = await storage.getChatConversation(userId);
      const newMessages = [...messages, { role: 'assistant', content: response }];
      
      if (conversation) {
        await storage.updateChatConversation(conversation.id, userId, newMessages);
      } else {
        await storage.createChatConversation(userId, { messages: newMessages });
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
      const conversation = await storage.getChatConversation(userId);
      res.json(conversation || { messages: [] });
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
      
      const recipe = await storage.getRecipe(recipeId, userId);
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
      
      const recipe = await storage.getRecipe(recipeId, userId);
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
      const usage = await storage.getUsageForMonth(userId, month);
      res.json(usage || { recipeQueries: 0, recipesGenerated: 0 });
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
