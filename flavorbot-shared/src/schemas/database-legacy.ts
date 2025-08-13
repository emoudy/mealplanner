// LEGACY FILE - PostgreSQL schema definitions (Shared Package)
// This file has been replaced by DynamoDB implementation
// Keeping for reference during migration period

/*
Original PostgreSQL schema definitions were here using Drizzle ORM
- pgTable definitions for users, recipes, usage_tracking, sessions
- Relations and indexes
- Zod schemas for validation

NOW USING: DynamoDB single-table design with PK/SK patterns
- No schema definitions needed (NoSQL)
- Data validation handled at application layer
- See: server/dynamodb-storage.ts for implementation
*/

// The shared package still exports TypeScript types for cross-platform use
// But no longer includes database-specific schema definitions