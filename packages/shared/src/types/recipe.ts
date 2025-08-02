import { z } from 'zod';

// Recipe category enum
export const recipeCategories = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
export type RecipeCategory = typeof recipeCategories[number];

// Base recipe schema
export const recipeSchema = z.object({
  id: z.number(),
  userId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  category: z.enum(recipeCategories),
  cookTime: z.number().min(1, 'Cook time must be at least 1 minute'),
  servings: z.number().min(1, 'Must serve at least 1 person'),
  imageUrl: z.string().optional(),
  isFromAI: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Create recipe schema (for API requests)
export const createRecipeSchema = recipeSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Update recipe schema
export const updateRecipeSchema = createRecipeSchema.partial();

// TypeScript types
export type Recipe = z.infer<typeof recipeSchema>;
export type CreateRecipeData = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeData = z.infer<typeof updateRecipeSchema>;

// Recipe with optional fields for display
export type RecipeDisplay = Omit<Recipe, 'userId'>;