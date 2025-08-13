/**
 * Utility functions for recipe category handling across all platforms
 */

export interface CategoryBadgeStyle {
  className: string;
  printClassName: string;
}

/**
 * Get consistent category badge styling for recipes
 * @param category - The recipe category (breakfast, lunch, dinner, snacks)
 * @returns Object with className and printClassName for styling
 */
export function getCategoryBadgeStyle(category: string): CategoryBadgeStyle {
  const lowerCategory = category.toLowerCase();
  
  switch (lowerCategory) {
    case 'breakfast':
      return {
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        printClassName: 'print:bg-yellow-100 print:text-yellow-800'
      };
    case 'lunch':
      return {
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        printClassName: 'print:bg-green-100 print:text-green-800'
      };
    case 'dinner':
      return {
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        printClassName: 'print:bg-blue-100 print:text-blue-800'
      };
    case 'snacks':
      return {
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        printClassName: 'print:bg-purple-100 print:text-purple-800'
      };
    default:
      return {
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        printClassName: 'print:bg-gray-200 print:text-gray-800'
      };
  }
}

/**
 * Get available meal categories
 */
export const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

export type MealCategory = typeof MEAL_CATEGORIES[number];

/**
 * Validate if a string is a valid meal category
 */
export function isValidMealCategory(category: string): category is MealCategory {
  return MEAL_CATEGORIES.includes(category.toLowerCase() as MealCategory);
}