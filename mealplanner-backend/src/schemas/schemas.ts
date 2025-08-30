import { z } from "zod";

// Authentication schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
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

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
  emailVerified: z.boolean().default(false),
  emailVerificationToken: z.string().optional(),
  authProvider: z.enum(["email", "google", "facebook"]).default("email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  profileImageUrl: z.string().url().nullable().optional(),
  subscriptionTier: z.enum(["free", "premium", "pro"]).default("free"),
  subscriptionStatus: z.enum(["active", "inactive", "cancelled"]).default("active"),
  emailNotifications: z.boolean().default(true),
  dietaryPreferences: z.array(z.string()).optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  darkMode: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Update User schema
export const updateUserSchema = userSchema.partial();

// A Recipe schema
export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()).min(1, "At least one instruction is required"),
  category: z.enum(["breakfast", "lunch", "dinner", "snacks", "dessert", "appetizer", "beverage"]),
  cookTime: z.number().min(1).max(480).optional(), // 1 minute to 8 hours
  servings: z.number().min(1).max(50).optional(),
  imageUrl: z.string().url().nullable(), // Either a valid URL or null, never undefined
});

// a recipe schema
export const recipeSchema = z.object({
  id: z.number(),
  userId: z.string(),
  ...createRecipeSchema.shape,
  createdAt: z.date(),
  updatedAt: z.date(),
  isFromAI: z.boolean().optional(),
});

// List of recipes schema
export const recipeListSchema = z.array(recipeSchema);

export const updateRecipeSchema = createRecipeSchema.partial().refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be updated",
});

// User profile schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  emailNotifications: z.boolean().optional(),
  darkMode: z.boolean().optional(),
});

// Chat schema
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
  conversationId: z.string().optional(),
});

// AI recipe generation schema
export const generateRecipeSchema = z.object({
  prompt: z.string().min(1, "Recipe prompt is required").max(500, "Prompt too long"),
  category: z.enum(["breakfast", "lunch", "dinner", "snacks", "dessert", "appetizer", "beverage"]).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  cookTime: z.number().min(1).max(480).optional(),
  servings: z.number().min(1).max(50).optional(),
});

// Usage tracking schema
export const usageStatsSchema = z.object({
  userId: z.string(),
  month: z.string(), // Format: "2024-08" (YYYY-MM)
  queries: z.number().min(0),
  recipesGenerated: z.number().min(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// update usage stats schema
export const updateUsageStatsSchema = usageStatsSchema.partial().omit({
  userId: true,      // Backend manages this
  month: true,       // Backend manages this
  createdAt: true,   // Backend manages this
  updatedAt: true    // Backend manages this
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be updated",
});

// Export type helpers
export type LoginData = z.infer<typeof loginSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type UserData = z.infer<typeof userSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;

export type CreateRecipeData = z.infer<typeof createRecipeSchema>;
export type RecipeData = z.infer<typeof recipeSchema>;
export type RecipeListData = z.infer<typeof recipeListSchema>;
export type UpdateRecipeData = z.infer<typeof updateRecipeSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type GenerateRecipeData = z.infer<typeof generateRecipeSchema>;

export type UsageStatsData = z.infer<typeof usageStatsSchema>;
export type UpdateUsageStatsData = z.infer<typeof updateUsageStatsSchema>;

