import type { SubscriptionTier, RecipeCategory, DietaryPreference } from "../types/index.js";
import { VALIDATION_LIMITS } from "../constants/index.js";

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Password strength validation
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < VALIDATION_LIMITS.USER.password.min) {
    feedback.push(`Password must be at least ${VALIDATION_LIMITS.USER.password.min} characters`);
  } else {
    score++;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Password must contain at least one uppercase letter");
  } else {
    score++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("Password must contain at least one lowercase letter");
  } else {
    score++;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push("Password must contain at least one number");
  } else {
    score++;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push("Password must contain at least one special character");
  } else if (score === 4) {
    score++; // Bonus point for special characters
  }

  return {
    isValid: score >= 4,
    score: Math.min(score, 4),
    feedback,
  };
}

// Recipe validation helpers
export function isValidRecipeCategory(category: string): category is RecipeCategory {
  const validCategories: RecipeCategory[] = [
    "breakfast", "lunch", "dinner", "snacks", "dessert", "appetizer", "beverage"
  ];
  return validCategories.includes(category as RecipeCategory);
}

export function isValidDietaryPreference(preference: string): preference is DietaryPreference {
  const validPreferences: DietaryPreference[] = [
    "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", 
    "paleo", "low-carb", "low-fat", "nut-free", "halal", "kosher"
  ];
  return validPreferences.includes(preference as DietaryPreference);
}

export function isValidSubscriptionTier(tier: string): tier is SubscriptionTier {
  return ["free", "basic", "pro"].includes(tier);
}

// Content validation
export function validateTextLength(
  text: string,
  minLength: number,
  maxLength: number
): { isValid: boolean; message?: string } {
  if (text.length < minLength) {
    return {
      isValid: false,
      message: `Text must be at least ${minLength} characters`,
    };
  }
  
  if (text.length > maxLength) {
    return {
      isValid: false,
      message: `Text must be no more than ${maxLength} characters`,
    };
  }
  
  return { isValid: true };
}

// Array validation
export function validateArrayLength<T>(
  array: T[],
  minLength: number,
  maxLength?: number
): { isValid: boolean; message?: string } {
  if (array.length < minLength) {
    return {
      isValid: false,
      message: `Must have at least ${minLength} item${minLength === 1 ? "" : "s"}`,
    };
  }
  
  if (maxLength && array.length > maxLength) {
    return {
      isValid: false,
      message: `Must have no more than ${maxLength} items`,
    };
  }
  
  return { isValid: true };
}

// Number validation
export function validateNumberRange(
  num: number,
  min: number,
  max: number
): { isValid: boolean; message?: string } {
  if (num < min) {
    return {
      isValid: false,
      message: `Value must be at least ${min}`,
    };
  }
  
  if (num > max) {
    return {
      isValid: false,
      message: `Value must be no more than ${max}`,
    };
  }
  
  return { isValid: true };
}

// File validation
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { isValid: boolean; message?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const extension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      message: `File extension ${extension} is not allowed`,
    };
  }

  return { isValid: true };
}

// Sanitization utilities
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid filename characters
  return filename
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}