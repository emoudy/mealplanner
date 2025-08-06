// Main entry point for @flavorbot/shared package

// Re-export all modules
export * from "./schemas/index.js";
export * from "./types/index.js";
export * from "./constants/index.js";
export * from "./api-client/index.js";
export * from "./utils/index.js";
export * from "./hooks/index.js";

// Version export
export const VERSION = "1.0.0";