import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const emailVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  token: z.string().min(1, "Verification token is required"),
});

// Recipe schemas
export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction is required"),
  category: z.enum(["breakfast", "lunch", "dinner", "snacks", "dessert", "appetizer", "beverage"]),
  cookTime: z.number().min(1).max(480).optional(), // 1 minute to 8 hours
  servings: z.number().min(1).max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateRecipeSchema = createRecipeSchema.partial();

// User profile schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  emailNotifications: z.boolean().optional(),
  darkMode: z.boolean().optional(),
});

// Chat schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
  conversationId: z.string().optional(),
});

// AI recipe generation schemas
export const generateRecipeSchema = z.object({
  prompt: z.string().min(1, "Recipe prompt is required").max(500, "Prompt too long"),
  category: z.enum(["breakfast", "lunch", "dinner", "snacks", "dessert", "appetizer", "beverage"]).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  cookTime: z.number().min(1).max(480).optional(),
  servings: z.number().min(1).max(50).optional(),
});

// Usage tracking schemas
export const usageStatsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format (YYYY-MM)"),
});

// Export type helpers
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type CreateRecipeData = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeData = z.infer<typeof updateRecipeSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type GenerateRecipeData = z.infer<typeof generateRecipeSchema>;
export type UsageStatsData = z.infer<typeof usageStatsSchema>;