import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { setupEmailAuth, isAuthenticated } from "./auth";
import { generateRecipe, getChatResponse } from "./anthropic";
import { createRecipeSchema, updateUserSchema } from "../mealplanner-shared/src/utils/schemas";
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
  // Setup email/password authentication
  await setupEmailAuth(app);

  // Universal user endpoint that works with both auth methods
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user; // User is already available from session
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Add /api/user endpoint to match frontend expectations
  app.get('/api/user', (req: any, res) => {
    console.log("User endpoint called, session:", req.session?.id, "authenticated:", req.isAuthenticated(), "user:", req.user?.id);
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      emailVerified: req.user.emailVerified,
      authProvider: req.user.authProvider,
    });
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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

      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const recipeData = createRecipeSchema.parse(req.body);
      const recipe = await dbStorage.createRecipe(userId, recipeData);
      res.json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.get('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const recipeId = parseInt(req.params.id);
      const updates = createRecipeSchema.partial().parse(req.body);
      const recipe = await dbStorage.updateRecipe(recipeId, userId, updates);
      res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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

      // Get conversation context from session for better recipe generation
      const conversationContext = req.session.chatMessages ? 
        (req.session.chatMessages as Array<{role: string, content: string}>) : [];

      const recipe = await generateRecipe(prompt, conversationContext);
      
      // Track usage
      await dbStorage.incrementUsage(userId, currentMonth, 'recipeQueries');
      
      // Add recipe generation to session conversation
      const userMessage = { role: 'user', content: prompt };
      const recipeMessage = { 
        role: 'assistant', 
        content: `I've created a recipe for you: **${recipe.title}**. Would you like me to save it to your collection?`,
        recipe: recipe
      };
      
      // Update session conversation with recipe
      const currentMessages = req.session.chatMessages || [];
      req.session.chatMessages = [...currentMessages, userMessage, recipeMessage];
      
      res.json(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ message: "Failed to generate recipe" });
    }
  });

  // Get user usage stats
  app.get('/api/usage/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const { messages } = req.body;
      
      if (!Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages must be an array" });
      }

      // Track chat usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      await dbStorage.incrementUsage(userId, currentMonth, 'recipeQueries');

      const response = await getChatResponse(messages);
      
      // Convert bullet characters to proper markdown format
      const formattedResponse = response
        .replace(/• /g, '- ')  // Convert bullet characters to markdown hyphens
        .replace(/•\s/g, '- '); // Handle various spacing
      
      // Extract dynamic suggestions from the response
      const extractSuggestions = (content: string): string[] => {
        const suggestions: string[] = [];

        
        const listPattern = /^[\s]*[•\-]\s*(.+)$/gm;
        let match;
        
        while ((match = listPattern.exec(content)) !== null) {
          let suggestion = match[1].trim();
          suggestion = suggestion.replace(/\*\*/g, '');
          
          // Simplified filtering - only exclude obvious non-recipe items
          if (suggestion.length > 5 && suggestion.length < 100 && 
              !suggestion.toLowerCase().includes('what i can help') &&
              !suggestion.toLowerCase().includes('speaking of food') &&
              !suggestion.toLowerCase().includes('help you with:') &&
              !suggestion.toLowerCase().includes('today?') &&
              !suggestion.toLowerCase().includes('right now?') &&
              !suggestion.toLowerCase().startsWith('what ') &&
              !suggestion.toLowerCase().startsWith('speaking ')) {
            suggestions.push(suggestion);
          }
        }
        
        // Also look for bold items like "**Item name**" (recipe titles)
        const boldPattern = /\*\*([^*]+)\*\*/g;
        while ((match = boldPattern.exec(content)) !== null) {
          const suggestion = match[1].trim();
          if (suggestion.length > 3 && suggestion.length < 50 && 
              !suggestion.toLowerCase().includes('quick') && 
              !suggestion.toLowerCase().includes('minutes') &&
              !suggestion.toLowerCase().includes('options') &&
              !suggestion.toLowerCase().includes('ideas') &&
              !suggestion.toLowerCase().includes('grab-and-go') &&
              !suggestion.toLowerCase().includes('protein-packed') &&
              !suggestion.toLowerCase().includes('energy-boosting')) {
            suggestions.push(suggestion);
          }
        }
        
        return Array.from(new Set(suggestions)).slice(0, 12); // Support up to 12 suggestions
      };
      
      const dynamicSuggestions = extractSuggestions(formattedResponse);
      
      // Store conversation and suggestions in session only (not database)
      const newMessages = [...messages, { role: 'assistant', content: formattedResponse }];
      req.session.chatMessages = newMessages;
      req.session.dynamicSuggestions = dynamicSuggestions;
      
      res.json({ response: formattedResponse, suggestions: dynamicSuggestions });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  app.get('/api/chatbot/conversation', isAuthenticated, async (req: any, res) => {
    try {
      // Get conversation from session only (temporary storage)
      const sessionMessages = req.session.chatMessages;
      
      // If no session messages exist, return welcome message
      if (!sessionMessages || !Array.isArray(sessionMessages) || sessionMessages.length === 0) {
        const welcomeMessage = [{
          role: 'assistant',
          content: "Hi! I'm MealPlanner, your AI recipe assistant. I can help you find recipes based on ingredients, dietary preferences, cooking time, or cuisine type. What would you like to cook today?"
        }];
        
        // Store welcome message in session
        req.session.chatMessages = welcomeMessage;
        req.session.dynamicSuggestions = [];
        
        res.json({ messages: welcomeMessage, suggestions: [] });
      } else {
        const suggestions = req.session.dynamicSuggestions || [];
        res.json({ messages: sessionMessages, suggestions });
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Email verification routes
  app.post('/api/auth/send-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const email = req.user.claims.email;
      
      if (!email) {
        return res.status(400).json({ message: "No email address found" });
      }

      const user = await dbStorage.getUser(userId);
      if (user?.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return res.status(500).json({ 
          message: "Email service not configured. Please contact support." 
        });
      }

      const token = await dbStorage.generateEmailVerificationToken(userId, email);
      const verificationUrl = `${req.protocol}://${req.hostname}/api/auth/verify-email?token=${token}&userId=${userId}`;
      
      const emailContent = `
        <h2>Welcome to MealPlanner!</h2>
        <p>Please verify your email address to start using all MealPlanner features:</p>
        <p><a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `;

      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your MealPlanner email address",
        html: emailContent,
      });

      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token, userId } = req.query as { token: string; userId: string };
      
      if (!token || !userId) {
        return res.status(400).send("Invalid verification link");
      }

      const success = await dbStorage.verifyEmail(userId, token);
      
      if (success) {
        res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
              <h1 style="color: #10B981;">Email Verified!</h1>
              <p>Your email has been successfully verified. You can now close this window and enjoy all MealPlanner features!</p>
              <a href="/" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Return to MealPlanner</a>
            </body>
          </html>
        `);
      } else {
        res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
              <h1 style="color: #EF4444;">Verification Failed</h1>
              <p>This verification link is invalid or has expired. Please request a new verification email.</p>
              <a href="/" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Return to MealPlanner</a>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).send("Error verifying email");
    }
  });

  // Recipe sharing routes
  app.post('/api/recipes/:id/share/email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await dbStorage.getUser(userId);
      
      // Check if user's email is verified
      if (!user?.emailVerified) {
        return res.status(400).json({ 
          message: "Please verify your email address before sharing recipes. Check your inbox for a verification email." 
        });
      }

      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return res.status(500).json({ 
          message: "Email service not configured. Please contact support to enable email sharing." 
        });
      }

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
      const userId = req.user.id;
      const recipeId = parseInt(req.params.id);
      const { phoneNumber, message } = req.body;
      
      if (!twilioClient) {
        return res.status(500).json({ message: "SMS service not configured" });
      }
      
      const recipe = await dbStorage.getRecipe(recipeId, userId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const smsContent = `${recipe.title}\n\n${recipe.description}\n\nGet the full recipe at: ${req.get('host')}/recipes/${recipeId}${message ? `\n\n${message}` : ''}`;

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
      const userId = req.user.id;
      const month = req.params.month;
      const usage = await dbStorage.getUsageForMonth(userId, month);
      res.json(usage || { recipeQueries: 0, recipesGenerated: 0 });
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // Meal plan routes
  app.get("/api/meal-plan", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { startDate, endDate, date } = req.query;

      if (date) {
        // Get meal plan for specific date
        const entries = await dbStorage.getMealPlanForDate(userId, date as string);
        res.json(entries);
      } else if (startDate && endDate) {
        // Get meal plan for date range
        const mealPlan = await dbStorage.getMealPlanForDateRange(userId, startDate as string, endDate as string);
        res.json(mealPlan);
      } else {
        res.status(400).json({ message: "Please provide either 'date' or both 'startDate' and 'endDate'" });
      }
    } catch (error) {
      console.error("Error getting meal plan:", error);
      res.status(500).json({ message: "Failed to get meal plan" });
    }
  });

  app.post("/api/meal-plan", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { date, recipeId, recipeTitle } = req.body;

      if (!date || !recipeId || !recipeTitle) {
        return res.status(400).json({ message: "Date, recipeId, and recipeTitle are required" });
      }

      const entry = await dbStorage.addRecipeToMealPlan(userId, date, recipeId, recipeTitle);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error adding recipe to meal plan:", error);
      if (error instanceof Error && error.message.includes("Cannot add more than 10 recipes")) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to add recipe to meal plan" });
      }
    }
  });

  app.delete("/api/meal-plan/:entryId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const entryId = parseInt(req.params.entryId);
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      await dbStorage.removeRecipeFromMealPlan(userId, entryId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing recipe from meal plan:", error);
      res.status(500).json({ message: "Failed to remove recipe from meal plan" });
    }
  });

  // Custom grocery item routes
  app.post("/api/grocery-items", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { name, category, quantity, unit } = req.body;

      if (!name || !category) {
        return res.status(400).json({ message: "Name and category are required" });
      }

      const item = await dbStorage.createCustomGroceryItem(userId, { name, category, quantity, unit });
      res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating custom grocery item:", error);
      res.status(500).json({ message: error.message || "Failed to create grocery item" });
    }
  });

  app.get("/api/grocery-items", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const items = await dbStorage.getUserCustomGroceryItems(userId);
      res.json(items);
    } catch (error: any) {
      console.error("Error getting custom grocery items:", error);
      res.status(500).json({ message: error.message || "Failed to get grocery items" });
    }
  });

  app.put("/api/grocery-items/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const itemId = req.params.id;
      const { name, category, quantity, unit } = req.body;

      const item = await dbStorage.updateCustomGroceryItem(itemId, userId, { name, category, quantity, unit });
      res.json(item);
    } catch (error: any) {
      console.error("Error updating custom grocery item:", error);
      res.status(500).json({ message: error.message || "Failed to update grocery item" });
    }
  });

  app.delete("/api/grocery-items/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const itemId = req.params.id;
      await dbStorage.deleteCustomGroceryItem(itemId, userId);
      res.status(200).json({ message: "Grocery item deleted" });
    } catch (error: any) {
      console.error("Error deleting custom grocery item:", error);
      res.status(500).json({ message: error.message || "Failed to delete grocery item" });
    }
  });

  app.delete("/api/grocery-items", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await dbStorage.clearAllCustomGroceryItems(userId);
      res.status(200).json({ message: "All custom grocery items cleared" });
    } catch (error: any) {
      console.error("Error clearing custom grocery items:", error);
      res.status(500).json({ message: error.message || "Failed to clear grocery items" });
    }
  });

  // Saved grocery list routes
  app.post('/api/saved-grocery-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { items, selectedRecipeIds, showCustomItems } = req.body;
      const savedList = {
        id: `saved-list-${userId}`,
        userId,
        items: items || [],
        selectedRecipeIds: selectedRecipeIds || [],
        showCustomItems: showCustomItems !== undefined ? showCustomItems : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await dbStorage.saveGroceryList(userId, savedList);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving grocery list:", error);
      res.status(500).json({ message: "Failed to save grocery list" });
    }
  });

  app.get('/api/saved-grocery-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const savedList = await dbStorage.getSavedGroceryList(userId);
      if (!savedList) {
        return res.status(404).json({ message: "No saved grocery list found" });
      }

      res.json(savedList);
    } catch (error) {
      console.error("Error getting saved grocery list:", error);
      res.status(500).json({ message: "Failed to get saved grocery list" });
    }
  });

  app.patch('/api/saved-grocery-list/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { itemId } = req.params;
      const updates = req.body;

      await dbStorage.updateGroceryListItem(userId, itemId, updates);
      res.status(204).send();
    } catch (error) {
      console.error("Error updating grocery list item:", error);
      res.status(500).json({ message: "Failed to update grocery list item" });
    }
  });

  app.delete('/api/saved-grocery-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await dbStorage.deleteSavedGroceryList(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting saved grocery list:", error);
      res.status(500).json({ message: "Failed to delete saved grocery list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
