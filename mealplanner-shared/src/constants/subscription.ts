import type { SubscriptionTier } from "../types/index.js";

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    recipeQueries: 50,
    recipesGenerated: 10,
    savedRecipes: 25,
    monthlyLimit: true,
  },
  basic: {
    recipeQueries: 200,
    recipesGenerated: 50,
    savedRecipes: 100,
    monthlyLimit: true,
  },
  pro: {
    recipeQueries: -1, // unlimited
    recipesGenerated: -1, // unlimited
    savedRecipes: -1, // unlimited
    monthlyLimit: false,
  },
} as const satisfies Record<SubscriptionTier, {
  recipeQueries: number;
  recipesGenerated: number;
  savedRecipes: number;
  monthlyLimit: boolean;
}>;

// Subscription features
export const SUBSCRIPTION_FEATURES = {
  free: {
    aiRecipeGeneration: true,
    recipeSaving: true,
    basicChatbot: true,
    recipeSharing: false,
    advancedFilters: false,
    exportRecipes: false,
    prioritySupport: false,
  },
  basic: {
    aiRecipeGeneration: true,
    recipeSaving: true,
    basicChatbot: true,
    recipeSharing: true,
    advancedFilters: true,
    exportRecipes: false,
    prioritySupport: false,
  },
  pro: {
    aiRecipeGeneration: true,
    recipeSaving: true,
    basicChatbot: true,
    recipeSharing: true,
    advancedFilters: true,
    exportRecipes: true,
    prioritySupport: true,
  },
} as const;

// Subscription pricing (in cents)
export const SUBSCRIPTION_PRICING = {
  basic: {
    monthly: 999, // $9.99
    yearly: 9990, // $99.90 (2 months free)
  },
  pro: {
    monthly: 1999, // $19.99
    yearly: 19990, // $199.90 (2 months free)
  },
} as const;

// Helper functions
export function getSubscriptionLimit(tier: SubscriptionTier, limitType: keyof typeof SUBSCRIPTION_LIMITS.free) {
  return SUBSCRIPTION_LIMITS[tier][limitType];
}

export function hasFeature(tier: SubscriptionTier, feature: keyof typeof SUBSCRIPTION_FEATURES.free) {
  return SUBSCRIPTION_FEATURES[tier][feature];
}

export function isLimitReached(
  tier: SubscriptionTier,
  current: number,
  limitType: keyof Pick<typeof SUBSCRIPTION_LIMITS.free, 'recipeQueries' | 'recipesGenerated' | 'savedRecipes'>
): boolean {
  const limit = getSubscriptionLimit(tier, limitType);
  return typeof limit === 'number' && limit !== -1 && current >= limit;
}