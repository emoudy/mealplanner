// Recipe domain routes extracted from lines 138-200 of routes.ts
import { Router } from 'express';

export function createRecipeRoutes(dependencies: any) {
  const router = Router();
  const { dbStorage, isAuthenticated, createRecipeSchema } = dependencies;

  // Simple test endpoint for development
  router.get('/test', (req, res) => {
    res.json({ 
      message: 'Recipes route is working!', 
      mockRecipesCount: 5, 
      timestamp: new Date().toISOString() 
    });
  });

  // Get recipes - Lines 138-147
  router.get('/', isAuthenticated, async (req: any, res) => {
    try {
      console.log('Getting recipes for user:', req.user?.id);
      const userId = req.user.id;
      const category = req.query.category as string;
      const recipes = await dbStorage.getRecipesByUser(userId, category);
      console.log('Found recipes:', recipes.length);
      return res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  // Create recipe - Lines 149-158
  router.post('/', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recipeData = createRecipeSchema.parse(req.body);
      const recipe = await dbStorage.createRecipe(userId, recipeData);
      return res.json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      return res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  // Get single recipe - Lines 160-173
  router.get('/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recipeId = parseInt(req.params.id);
      const recipe = await dbStorage.getRecipe(recipeId, userId);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      return res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      return res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  // Update recipe - Lines 175-185
  router.patch('/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recipeId = parseInt(req.params.id);
      const updates = createRecipeSchema.partial().parse(req.body);
      const recipe = await dbStorage.updateRecipe(recipeId, userId, updates);
      return res.json(recipe);
    } catch (error) {
      console.error("Error updating recipe:", error);
      return res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  // Delete recipe - Lines 187-200
  router.delete('/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recipeId = parseInt(req.params.id);
      await dbStorage.deleteRecipe(recipeId, userId);
      return res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      return res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Recipe search route - Lines 209-218
  router.get('/search/:query', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const query = req.params.query;
      const recipes = await dbStorage.searchRecipes(userId, query);
      return res.json(recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      return res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  return router;
}
