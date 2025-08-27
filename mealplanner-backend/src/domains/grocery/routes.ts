// Grocery domain routes extracted from lines 625-820 of routes.ts
import { Router } from 'express';

export function createGroceryRoutes(dependencies: any) {
  const router = Router();
  const { dbStorage, isAuthenticated } = dependencies;

  // Test endpoint for grocery
  router.get('/test', (req, res) => {
    res.json({ 
      message: 'Grocery routes are working!', 
      availableEndpoints: [
        'POST /api/grocery-items - Create custom grocery item',
        'GET /api/grocery-items - Get user custom grocery items',
        'PUT /api/grocery-items/:id - Update custom grocery item',
        'DELETE /api/grocery-items/:id - Delete custom grocery item'
      ],
      timestamp: new Date().toISOString() 
    });
  });

  // Custom grocery item routes - Lines 625-739
  router.post('/items', isAuthenticated, async (req: any, res) => {
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
      return res.status(201).json(item);
    } catch (error: any) {
      console.error("Error creating custom grocery item:", error);
      return res.status(500).json({ message: error.message || "Failed to create grocery item" });
    }
  });

  router.get('/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const items = await dbStorage.getUserCustomGroceryItems(userId);
      return res.json(items);
    } catch (error: any) {
      console.error("Error getting custom grocery items:", error);
      return res.status(500).json({ message: error.message || "Failed to get grocery items" });
    }
  });

  router.put('/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const itemId = req.params.id;
      const { name, category, quantity, unit } = req.body;

      const item = await dbStorage.updateCustomGroceryItem(itemId, userId, { name, category, quantity, unit });
      return res.json(item);
    } catch (error: any) {
      console.error("Error updating custom grocery item:", error);
      return res.status(500).json({ message: error.message || "Failed to update grocery item" });
    }
  });

  router.delete('/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const itemId = req.params.id;
      await dbStorage.deleteCustomGroceryItem(itemId, userId);
      return res.status(200).json({ message: "Grocery item deleted" });
    } catch (error: any) {
      console.error("Error deleting custom grocery item:", error);
      return res.status(500).json({ message: error.message || "Failed to delete grocery item" });
    }
  });

  router.delete('/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await dbStorage.clearAllCustomGroceryItems(userId);
      return res.status(200).json({ message: "All custom grocery items cleared" });
    } catch (error: any) {
      console.error("Error clearing custom grocery items:", error);
      return res.status(500).json({ message: error.message || "Failed to clear grocery items" });
    }
  });

  // Saved grocery list routes - Lines 741-820
  router.post('/saved-grocery-list', isAuthenticated, async (req: any, res) => {
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
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error saving grocery list:", error);
      return res.status(500).json({ message: "Failed to save grocery list" });
    }
  });

  router.get('/saved-grocery-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const savedList = await dbStorage.getSavedGroceryList(userId);
      if (!savedList) {
        return res.status(404).json({ message: "No saved grocery list found" });
      }

      return res.json(savedList);
    } catch (error) {
      console.error("Error getting saved grocery list:", error);
      return res.status(500).json({ message: "Failed to get saved grocery list" });
    }
  });

  router.patch('/saved-grocery-list/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { itemId } = req.params;
      const updates = req.body;

      await dbStorage.updateGroceryListItem(userId, itemId, updates);
      return res.status(204).send();
    } catch (error) {
      console.error("Error updating grocery list item:", error);
      return res.status(500).json({ message: "Failed to update grocery list item" });
    }
  });

  router.delete('/saved-grocery-list', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await dbStorage.deleteSavedGroceryList(userId);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting saved grocery list:", error);
      return res.status(500).json({ message: "Failed to delete saved grocery list" });
    }
  });

  return router;
}
