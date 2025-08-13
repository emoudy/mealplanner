export interface MealPlanEntry {
  id: number;
  userId: string;
  date: string; // Format: YYYY-MM-DD
  recipeId: number;
  recipeTitle: string;
  createdAt: string;
}

export interface CreateMealPlanEntryData {
  date: string;
  recipeId: number;
  recipeTitle: string;
}

export interface MealPlanResponse {
  [date: string]: MealPlanEntry[];
}