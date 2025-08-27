import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "../mealplanner-backend/src/routes/index.js";

// This file is now a simple wrapper that delegates to the new domain-organized structure
export async function registerRoutes(app: Express): Promise<Server> {
  console.log("⚠️  DEPRECATED: This routes.ts file is now a legacy wrapper.");
  console.log("✅ The new domain-organized structure is in mealplanner-backend/src/");
  
  // Import and use the new domain-organized routes
  const { registerRoutes: newRegisterRoutes } = await import("../mealplanner-backend/src/routes/index.js");
  return newRegisterRoutes(app);
}
