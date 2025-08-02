import { z } from 'zod';
import { Recipe } from './recipe';

// Chat message types
export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
  recipe: z.any().optional(), // Recipe object if AI generated one
});

// Chat session
export const chatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  messages: z.array(chatMessageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// API request schemas
export const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().optional(),
});

export const generateRecipeSchema = z.object({
  prompt: z.string().min(1, 'Recipe prompt cannot be empty'),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()).default([]),
    cookingTime: z.number().optional(),
    servings: z.number().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  }).default({}),
});

// TypeScript types
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
export type SendMessageData = z.infer<typeof sendMessageSchema>;
export type GenerateRecipeData = z.infer<typeof generateRecipeSchema>;

// UI-specific message type with loading states
export interface ChatMessageUI extends ChatMessage {
  isLoading?: boolean;
  error?: string;
}