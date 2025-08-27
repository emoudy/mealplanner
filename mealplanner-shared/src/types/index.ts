// Re-export all types
export * from "./api.js";

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Platform-specific types
export interface PlatformConfig {
  apiUrl: string;
  environment: "development" | "production" | "test";
  platform: "web" | "mobile";
}

// Subscription tiers
export type SubscriptionTier = "free" | "basic" | "pro";

// Recipe categories
export type RecipeCategory = 
  | "breakfast" 
  | "lunch" 
  | "dinner" 
  | "snacks" 
  | "dessert" 
  | "appetizer" 
  | "beverage";

// Dietary preferences
export type DietaryPreference = 
  | "vegetarian"
  | "vegan" 
  | "gluten-free"
  | "dairy-free"
  | "keto"
  | "paleo"
  | "low-carb"
  | "low-fat"
  | "nut-free"
  | "halal"
  | "kosher";

// Theme types
export type Theme = "light" | "dark" | "system";

// Language types
export type Language = "en" | "es" | "fr" | "de" | "it" | "pt" | "ja" | "ko" | "zh";