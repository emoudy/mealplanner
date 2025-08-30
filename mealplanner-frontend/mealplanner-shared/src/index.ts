// Main entry point for @mealplanner/shared package

// Re-export all modules
export * from "./types/index.js";
export * from "./constants/index.js";
export * from "./api-client/index.js";
export * from "./utils/index.js";
export * from "./hooks/index.js";
export * from "./mocks/mock-data.js";

// Version export
export const VERSION = "1.0.0";