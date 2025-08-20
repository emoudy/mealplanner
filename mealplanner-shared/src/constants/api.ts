// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/api/login",
    REGISTER: "/api/register",
    LOGOUT: "/api/logout",
    USER: "/api/user",
    VERIFY_EMAIL: "/api/verify-email",
  },
  
  // Recipes
  RECIPES: {
    LIST: "/api/recipes",
    CREATE: "/api/recipes",
    GET: (id: number) => `/api/recipes/${id}`,
    UPDATE: (id: number) => `/api/recipes/${id}`,
    DELETE: (id: number) => `/api/recipes/${id}`,
    GENERATE: "/api/recipes/generate",
  },
  
  // Chat
  CHAT: {
    MESSAGE: "/api/chat",
    CONVERSATIONS: "/api/chat/conversations",
    CONVERSATION: (id: string) => `/api/chat/conversations/${id}`,
  },
  
  // User profile
  USER: {
    PROFILE: "/api/user/profile",
    UPLOAD_PHOTO: "/api/user/upload-photo",
    DELETE_ACCOUNT: "/api/user/account",
  },
  
  // Usage tracking
  USAGE: {
    STATS: "/api/usage/stats",
    HISTORY: "/api/usage/history",
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API response messages
export const API_MESSAGES = {
  SUCCESS: {
    LOGIN: "Successfully logged in",
    LOGOUT: "Successfully logged out",
    REGISTER: "Account created successfully",
    EMAIL_VERIFIED: "Email verified successfully",
    RECIPE_CREATED: "Recipe created successfully",
    RECIPE_UPDATED: "Recipe updated successfully",
    RECIPE_DELETED: "Recipe deleted successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    PHOTO_UPLOADED: "Photo uploaded successfully",
  },
  ERROR: {
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_NOT_VERIFIED: "Please verify your email before logging in",
    EMAIL_ALREADY_EXISTS: "Email address already in use",
    RECIPE_NOT_FOUND: "Recipe not found",
    USER_NOT_FOUND: "User not found",
    UNAUTHORIZED: "You are not authorized to perform this action",
    RATE_LIMITED: "Too many requests. Please try again later.",
    VALIDATION_ERROR: "Validation error",
    INTERNAL_ERROR: "An internal error occurred",
  },
} as const;