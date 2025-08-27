// AI/Chat domain routes extracted from lines 223-389 of routes.ts
import { Router } from 'express';

export function createAiChatRoutes(dependencies: any) {
  const router = Router();
  const { dbStorage, isAuthenticated, generateRecipe, getChatResponse } = dependencies;

  // Generate recipe with AI - Lines 223-270
  router.post('/generate-recipe', isAuthenticated, async (req: any, res) => {
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
      
      return res.json(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      return res.status(500).json({ message: "Failed to generate recipe" });
    }
  });

  // Get user usage stats - Lines 272-285
  router.get('/usage/stats', isAuthenticated, async (req: any, res) => {
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

  // Chat with AI - Lines 287-347
  router.post('/chat', isAuthenticated, async (req: any, res) => {
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
      
      return res.json({ response: formattedResponse, suggestions: dynamicSuggestions });
    } catch (error) {
      console.error("Error in chat:", error);
      return res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  // Get conversation history - Lines 349-389
  router.get('/conversation', isAuthenticated, async (req: any, res) => {
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

  return router;
}
