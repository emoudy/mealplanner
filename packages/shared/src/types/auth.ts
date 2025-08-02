import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.boolean().default(true),
    dietaryRestrictions: z.array(z.string()).default([]),
  }).default({}),
  createdAt: z.string(),
});

// Auth state
export const authStateSchema = z.object({
  isAuthenticated: z.boolean(),
  user: userSchema.nullable(),
  isLoading: z.boolean(),
});

// TypeScript types
export type User = z.infer<typeof userSchema>;
export type AuthState = z.infer<typeof authStateSchema>;

// Login/register schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;