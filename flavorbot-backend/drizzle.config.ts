import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./node_modules/@flavorbot/shared/dist/schemas/database.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});