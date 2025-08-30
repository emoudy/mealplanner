import type { Recipe } from "./types.js";

// Mock data for development - easily removable when AWS DynamoDB is configured
export const mockRecipes: Recipe[] = [
  {
    id: 1,
    title: "Classic Spaghetti Carbonara",
    description: "A creamy Italian pasta dish with eggs, cheese, and pancetta",
    ingredients: [
      "400g spaghetti",
      "200g pancetta or guanciale, diced",
      "4 large eggs",
      "100g Pecorino Romano cheese, grated",
      "100g Parmigiano-Reggiano cheese, grated",
      "Freshly ground black pepper",
      "Salt for pasta water"
    ],
    instructions: [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions",
      "While pasta cooks, heat a large skillet and cook pancetta until crispy",
      "In a bowl, whisk together eggs, both cheeses, and plenty of black pepper",
      "Reserve 1 cup pasta water before draining",
      "Add hot drained pasta to the skillet with pancetta",
      "Remove from heat and quickly stir in egg mixture, adding pasta water as needed",
      "Serve immediately with extra cheese and pepper"
    ],
    cookTime: 20,
    servings: 4,
    category: "dinner",
    userId: "mock-user-1",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z")
  },
  {
    id: 2,
    title: "Avocado Toast with Poached Egg",
    description: "A healthy and delicious breakfast option",
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 fresh eggs",
      "1 tablespoon white vinegar",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)",
      "Lemon juice"
    ],
    instructions: [
      "Toast the bread slices until golden brown",
      "Bring a pot of water to simmer and add vinegar",
      "Crack eggs into small bowls",
      "Create a whirlpool in the water and gently drop in eggs",
      "Poach for 3-4 minutes until whites are set",
      "Mash avocado with salt, pepper, and lemon juice",
      "Spread avocado on toast and top with poached eggs",
      "Season with salt, pepper, and red pepper flakes"
    ],
    cookTime: 15,
    servings: 2,
    category: "breakfast",
    userId: "mock-user-1",
    createdAt: new Date("2024-01-16T08:00:00Z"),
    updatedAt: new Date("2024-01-16T08:00:00Z")
  },
  {
    id: 3,
    title: "Chicken Tikka Masala",
    description: "Creamy tomato-based curry with tender chicken pieces",
    ingredients: [
      "1 lb chicken breast, cut into chunks",
      "1 cup plain yogurt",
      "2 tablespoons tikka masala spice blend",
      "1 onion, diced",
      "3 garlic cloves, minced",
      "1 inch ginger, grated",
      "1 can crushed tomatoes",
      "1 cup heavy cream",
      "2 tablespoons vegetable oil",
      "Salt and cilantro for garnish"
    ],
    instructions: [
      "Marinate chicken in yogurt and half the spice blend for 30 minutes",
      "Heat oil in a large skillet and cook marinated chicken until done",
      "Remove chicken and set aside",
      "In same pan, sauté onion until soft",
      "Add garlic, ginger, and remaining spices, cook 1 minute",
      "Add crushed tomatoes and simmer 10 minutes",
      "Stir in cream and return chicken to pan",
      "Simmer until heated through, garnish with cilantro"
    ],
    cookTime: 45,
    servings: 4,
    category: "dinner",
    userId: "mock-user-2",
    createdAt: new Date("2024-01-17T18:00:00Z"),
    updatedAt: new Date("2024-01-17T18:00:00Z")
  },
  {
    id: 4,
    title: "Greek Salad",
    description: "Fresh Mediterranean salad with feta cheese and olives",
    ingredients: [
      "2 large cucumbers, sliced",
      "3 tomatoes, cut into wedges",
      "1 red onion, thinly sliced",
      "200g feta cheese, cubed",
      "1 cup Kalamata olives",
      "1/4 cup olive oil",
      "2 tablespoons red wine vinegar",
      "1 teaspoon dried oregano",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Combine cucumbers, tomatoes, and red onion in a large bowl",
      "Add feta cheese and olives",
      "Whisk together olive oil, vinegar, oregano, salt, and pepper",
      "Pour dressing over salad and toss gently",
      "Let stand 10 minutes before serving to allow flavors to meld"
    ],
    cookTime: 15,
    servings: 4,
    category: "lunch",
    userId: "mock-user-2",
    createdAt: new Date("2024-01-18T12:00:00Z"),
    updatedAt: new Date("2024-01-18T12:00:00Z")
  },
  {
    id: 5,
    title: "Chocolate Chip Cookies",
    description: "Classic homemade cookies perfect for any occasion",
    ingredients: [
      "2 1/4 cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup butter, softened",
      "3/4 cup granulated sugar",
      "3/4 cup brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips"
    ],
    instructions: [
      "Preheat oven to 375°F (190°C)",
      "Mix flour, baking soda, and salt in a bowl",
      "Cream butter and both sugars until fluffy",
      "Beat in eggs and vanilla",
      "Gradually mix in flour mixture",
      "Stir in chocolate chips",
      "Drop rounded tablespoons onto ungreased baking sheets",
      "Bake 9-11 minutes until golden brown"
    ],
    cookTime: 25,
    servings: 48,
    category: "dessert",
    userId: "mock-user-1",
    createdAt: new Date("2024-01-19T15:00:00Z"),
    updatedAt: new Date("2024-01-19T15:00:00Z")
  }
];

// Mock users for development
export const mockUsers = [
  {
    id: "mock-user-1",
    email: "demo@mealplanner.com",
    password: "demo123",
    firstName: "Demo",
    lastName: "User",
    emailVerified: true,
    authProvider: "email" as const,
    subscriptionTier: "pro" as const,
    subscriptionStatus: "active" as const,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    id: "mock-user-2", 
    email: "chef@mealplanner.com",
    password: "chef123",
    firstName: "Chef",
    lastName: "Demo",
    emailVerified: true,
    authProvider: "email" as const,
    subscriptionTier: "basic" as const,
    subscriptionStatus: "active" as const,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z")
  }
];

console.log("📦 Mock data loaded - Remove this file when AWS DynamoDB is configured");
