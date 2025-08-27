// Notifications domain routes extracted from lines 401-557 of routes.ts
import { Router } from 'express';

export function createNotificationRoutes(dependencies: any) {
  const router = Router();
  const { dbStorage, isAuthenticated, emailTransporter, twilioClient } = dependencies;

  // Email verification routes - Lines 401-445
  router.post('/auth/send-verification', isAuthenticated, async (req: any, res) => {
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

      return res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Error sending verification email:", error);
      return res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  router.get('/auth/verify-email', async (req: any, res) => {
    try {
      const { token, userId } = req.query as { token: string; userId: string };
      
      if (!token || !userId) {
        return res.status(400).send("Invalid verification link");
      }

      const success = await dbStorage.verifyEmail(userId, token);
      
      if (success) {
        return res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
              <h1 style="color: #10B981;">Email Verified!</h1>
              <p>Your email has been successfully verified. You can now close this window and enjoy all MealPlanner features!</p>
              <a href="/" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Return to MealPlanner</a>
            </body>
          </html>
        `);
      } else {
        return res.status(400).send(`
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
      return res.status(500).send("Error verifying email");
    }
  });

  // Recipe sharing routes - Lines 447-508
  router.post('/recipes/:id/share/email', isAuthenticated, async (req: any, res) => {
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

      return res.json({ message: "Recipe shared via email successfully" });
    } catch (error) {
      console.error("Error sharing recipe via email:", error);
      return res.status(500).json({ message: "Failed to share recipe via email" });
    }
  });

  router.post('/recipes/:id/share/sms', isAuthenticated, async (req: any, res) => {
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

      return res.json({ message: "Recipe shared via SMS successfully" });
    } catch (error) {
      console.error("Error sharing recipe via SMS:", error);
      return res.status(500).json({ message: "Failed to share recipe via SMS" });
    }
  });

  // Usage tracking route - Lines 510-520
  router.get('/usage/:month', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const month = req.params.month;
      const usage = await dbStorage.getUsageForMonth(userId, month);
      return res.json(usage || { recipeQueries: 0, recipesGenerated: 0 });
    } catch (error) {
      console.error("Error fetching usage:", error);
      return res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  return router;
}
