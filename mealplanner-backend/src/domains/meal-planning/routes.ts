// Meal planning domain routes extracted from lines 559-646 of routes.ts
import { Router } from 'express';

export function createMealPlanningRoutes(dependencies: any) {
  const router = Router();
  const { dbStorage, isAuthenticated } = dependencies;

  // Test endpoint for meal planning
  router.get('/test', (req, res) => {
    res.json({ 
      message: 'Meal planning routes are working!', 
      availableEndpoints: [
        'GET /api/meal-plan?date=YYYY-MM-DD - Get meal plan for specific date',
        'GET /api/meal-plan?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - Get meal plan range',
        'POST /api/meal-plan - Add meal to plan'
      ],
      timestamp: new Date().toISOString() 
    });
  });

  // Get meal plan - Lines 559-580
  router.get('/', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { startDate, endDate, date } = req.query;

      if (date) {
        // Get meal plan for specific date
        const entries = await dbStorage.getMealPlanForDate(userId, date as string);
        return res.json(entries);
      } else if (startDate && endDate) {
        // Get meal plan for date range
        const mealPlan = await dbStorage.getMealPlanForDateRange(userId, startDate as string, endDate as string);
        return res.json(mealPlan);
      } else {
        return res.status(400).json({ message: "Please provide either 'date' or both 'startDate' and 'endDate'" });
      }
    } catch (error) {
      console.error("Error getting meal plan:", error);
      return res.status(500).json({ message: "Failed to get meal plan" });
    }
  });

  // Add recipe to meal plan - Lines 582-604
  router.post('/', isAuthenticated, async (req: any, res) => {
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
      return res.status(201).json(entry);
    } catch (error: any) {
      console.error("Error adding recipe to meal plan:", error);
      if (error instanceof Error && error.message.includes("Cannot add more than 10 recipes")) {
        return res.status(400).json({ message: error.message });
      } else {
        return res.status(500).json({ message: "Failed to add recipe to meal plan" });
      }
    }
  });

  // Remove recipe from meal plan - Lines 606-623
  router.delete('/:entryId', isAuthenticated, async (req: any, res) => {
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
      return res.status(204).send();
    } catch (error) {
      console.error("Error removing recipe from meal plan:", error);
      return res.status(500).json({ message: "Failed to remove recipe from meal plan" });
    }
  });

  return router;
}
