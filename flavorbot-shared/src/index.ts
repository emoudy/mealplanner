// Types
export * from './types/index.js';

// API Client
export { apiClient, isUnauthorizedError, isNetworkError } from './api/client.js';
export type { ApiError } from './api/client.js';

// Hooks
export { useAuth, useIsAuthenticated, useCurrentUser, AUTH_QUERY_KEY } from './hooks/useAuth.js';
export { 
  useRecipes, 
  useRecipe, 
  useCreateRecipe, 
  useUpdateRecipe, 
  useDeleteRecipe, 
  useRecipeSearch,
  RECIPES_QUERY_KEY 
} from './hooks/useRecipes.js';
export { 
  useChatbot, 
  useChatSuggestions,
  CHAT_CONVERSATION_KEY 
} from './hooks/useChatbot.js';
export { 
  useUsageStats, 
  useUsageLimits,
  USAGE_STATS_KEY 
} from './hooks/useUsageStats.js';

// Validation
export {
  recipeFormSchema,
  chatMessageSchema,
  userProfileSchema,
  searchQuerySchema,
  validateRecipeForm,
  validateChatMessage,
  validateUserProfile,
  validateSearchQuery,
  formatValidationErrors,
} from './utils/validation.js';

// Platform utilities
export {
  detectPlatform,
  isWeb,
  isMobile,
  isDesktop,
  getFeatures,
  storage,
  navigation,
} from './utils/platform.js';

// Constants
export const QUERY_KEYS = {
  AUTH: '/api/auth/user',
  RECIPES: '/api/recipes',
  CHAT: '/api/chatbot/conversation',
  USAGE: '/api/usage/stats',
} as const;

// Version
export const VERSION = '1.0.0';