// Re-export all constants
export * from "./api.js";
export * from "./subscription.js";

// General application constants
export const APP_CONFIG = {
  NAME: "MealPlanner",
  DESCRIPTION: "AI-Powered Recipe Management Platform",
  VERSION: "1.0.0",
  SUPPORT_EMAIL: "pemony.mealplanner@gmail.com",
  WEBSITE_URL: "https://moudy.com/mealplanner",
} as const;

// Recipe categories with display names
export const RECIPE_CATEGORIES = {
  breakfast: "Breakfast",
  lunch: "Lunch", 
  dinner: "Dinner",
  snacks: "Snacks",
  dessert: "Dessert",
  appetizer: "Appetizer",
  beverage: "Beverage",
} as const;

// Dietary preferences with display names
export const DIETARY_PREFERENCES = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-Free",
  "dairy-free": "Dairy-Free",
  keto: "Keto",
  paleo: "Paleo",
  "low-carb": "Low-Carb",
  "low-fat": "Low-Fat",
  "nut-free": "Nut-Free",
  halal: "Halal",
  kosher: "Kosher",
} as const;

// Validation constants
export const VALIDATION_LIMITS = {
  USER: {
    firstName: { min: 1, max: 50 },
    lastName: { min: 1, max: 50 },
    bio: { min: 0, max: 500 },
    password: { min: 12, max: 128 },
  },
  RECIPE: {
    title: { min: 1, max: 200 },
    description: { min: 0, max: 1000 },
    ingredients: { min: 1, max: 50 },
    instructions: { min: 1, max: 20 },
    cookTime: { min: 1, max: 480 }, // 8 hours max
    servings: { min: 1, max: 50 },
  },
  CHAT: {
    message: { min: 1, max: 1000 },
    prompt: { min: 1, max: 500 },
  },
} as const;