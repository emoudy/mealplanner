import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@flavorbot/shared/schemas";

// Configure Neon for WebSocket support
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with simplified configuration for stability
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle({ client: pool, schema });