import { z } from 'zod';

// Recipe validation schemas
export const recipeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  ingredients: z.array(z.string().min(1, 'Ingredient cannot be empty')).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'At least one instruction is required'),
  category: z.enum(['breakfast', 'lunch', 'dinner', 'snacks'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  cookTime: z.number().min(1, 'Cook time must be at least 1 minute').max(1440, 'Cook time cannot exceed 24 hours'),
  servings: z.number().min(1, 'Servings must be at least 1').max(100, 'Servings cannot exceed 100'),
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
});

// User profile validation
export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional(),
  email: z.string().email('Invalid email address'),
});

// Search validation
export const searchQuerySchema = z.object({
  query: z.string().max(100, 'Search query must be less than 100 characters'),
  category: z.enum(['all', 'breakfast', 'lunch', 'dinner', 'snacks']).default('all'),
});

// Utility functions for validation
export const validateRecipeForm = (data: unknown) => {
  return recipeFormSchema.safeParse(data);
};

export const validateChatMessage = (data: unknown) => {
  return chatMessageSchema.safeParse(data);
};

export const validateUserProfile = (data: unknown) => {
  return userProfileSchema.safeParse(data);
};

export const validateSearchQuery = (data: unknown) => {
  return searchQuerySchema.safeParse(data);
};

// Error formatting
export const formatValidationErrors = (errors: z.ZodError) => {
  return errors.errors.reduce((acc, error) => {
    const path = error.path.join('.');
    acc[path] = error.message;
    return acc;
  }, {} as Record<string, string>);
};