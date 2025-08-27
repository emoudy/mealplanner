// User domain routes extracted from lines 67-135 of routes.ts
import { Router } from 'express';

export function createUserRoutes(dependencies: any) {
  const router = Router();
  const { dbStorage, isAuthenticated, updateUserSchema, upload } = dependencies;

  // Universal user endpoint - Lines 67-75
  router.get('/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User endpoint - Lines 79-88
  router.get('/user', (req: any, res) => {
    console.log("User endpoint called");
    
    // In development mode with mock data, return mock user
    if (process.env.NODE_ENV === 'development' && !process.env.AWS_ACCESS_KEY_ID) {
      const mockUser = {
        id: 'mock-user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return res.json(mockUser);
    }
    
    // Production authentication check
    console.log("Session:", req.session?.id, "authenticated:", req.isAuthenticated?.(), "user:", req.user?.id);
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      emailVerified: req.user.emailVerified,
      authProvider: req.user.authProvider,
    });
  });

  // User profile update - Lines 89-98
  router.patch('/user/profile', isAuthenticated, async (req: any, res) => {
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

  // Account deletion - Lines 103-111
  router.delete('/user/account', isAuthenticated, async (_req: any, res) => {
    try {
      // In a real app, you'd implement account deletion logic
      return res.json({ message: "Account deletion requested" });
    } catch (error) {
      console.error("Error deleting account:", error);
      return res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Photo upload - Lines 113-135
  router.post('/user/upload-photo', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.id;
      const photoUrl = `/uploads/${req.file.filename}`;
      
      const user = await dbStorage.updateUser(userId, {
        profileImageUrl: photoUrl
      });

      return res.json({ 
        message: "Photo uploaded successfully",
        profileImageUrl: photoUrl,
        user 
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      return res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  return router;
}
