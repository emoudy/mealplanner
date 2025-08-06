# FlavorBot DynamoDB Migration Complete

## Migration Summary

FlavorBot has been successfully migrated from PostgreSQL to Amazon DynamoDB. This change provides better scalability and aligns with modern cloud-native architecture patterns.

## What Changed

### 1. Database Layer
- **Removed**: PostgreSQL with Drizzle ORM
- **Added**: Amazon DynamoDB with AWS SDK v3
- **Storage**: New `DynamoDBStorage` class implements the same `IStorage` interface

### 2. Data Model
**Single Table Design:**
```
Table: flavorbot-dev

Primary Key:
- PK (Partition Key): String  
- SK (Sort Key): String

Item Types:
USER#userId     | PROFILE              -> User profile
USER#userId     | RECIPE#recipeId      -> User's recipe  
USER#userId     | USAGE#2025-01        -> Monthly usage
USER#userId     | SESSION#sessionId    -> Session data
SESSION#sid     | DATA                 -> Express sessions
```

### 3. Session Management
- **Removed**: PostgreSQL session store (`connect-pg-simple`)
- **Added**: Custom DynamoDB session store
- Sessions now stored in the same DynamoDB table

### 4. Configuration Changes

**Environment Variables:**
```bash
# DynamoDB Configuration
DYNAMODB_TABLE_NAME=flavorbot-dev
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=        # Leave blank for local dev
AWS_SECRET_ACCESS_KEY=    # Leave blank for local dev

# For local DynamoDB (uncomment for local testing):
# DYNAMODB_ENDPOINT=http://localhost:8000
```

**New NPM Scripts:**
- `npm run db:setup` - Create DynamoDB table
- `npm run db:local` - Start local DynamoDB (requires setup)

### 5. Code Changes

**Key Files Modified:**
- `server/dynamodb.ts` - DynamoDB client configuration
- `server/dynamodb-storage.ts` - DynamoDB storage implementation
- `server/session-dynamodb.ts` - DynamoDB session store
- `server/storage.ts` - Updated to use DynamoDB storage
- `server/auth.ts` - Updated session configuration
- `server/index.ts` - Added DynamoDB table initialization

**Legacy Files (Commented Out):**
- PostgreSQL storage implementation in `server/storage.ts`
- Drizzle ORM schemas still available in `flavorbot-shared` package

## Local Development Setup

### Option 1: Use Fake Credentials (Recommended for Quick Testing)
The app will use fake AWS credentials by default and attempt to connect to AWS DynamoDB. This will work for testing the code structure but may encounter connection issues.

### Option 2: Local DynamoDB (Full Local Development)
1. Install DynamoDB Local: `npm install -g dynamodb-local`
2. Start local DynamoDB: `npm run db:local`
3. Set environment variable: `DYNAMODB_ENDPOINT=http://localhost:8000`
4. Create table: `npm run db:setup`

### Option 3: AWS DynamoDB (Production-like)
1. Create AWS account and DynamoDB table
2. Set environment variables:
   - `AWS_ACCESS_KEY_ID=your-key`
   - `AWS_SECRET_ACCESS_KEY=your-secret`
   - `DYNAMODB_TABLE_NAME=flavorbot-dev`

## Data Migration

**Note:** This migration does not include data transfer from PostgreSQL to DynamoDB. The existing PostgreSQL data would need to be migrated separately if preserving existing data is required.

For a fresh start, users will need to:
1. Re-register accounts
2. Re-save recipes
3. Start fresh with usage tracking

## Benefits of DynamoDB

1. **Scalability**: Auto-scales to handle any load
2. **Performance**: Single-digit millisecond latency
3. **Managed**: No database maintenance required
4. **Cost-effective**: Pay only for what you use
5. **Global**: Multi-region replication available
6. **Serverless**: Perfect for cloud-native deployments

## Trade-offs

1. **Query Limitations**: No complex JOINs or ad-hoc queries
2. **Learning Curve**: Different data modeling approach
3. **Local Development**: More complex setup than PostgreSQL
4. **Cost**: Can be expensive with inefficient access patterns
5. **Debugging**: Less familiar tooling than SQL databases

## Architecture Benefits for FlavorBot

- **Recipe Storage**: Efficient user-based partitioning
- **Session Management**: Fast session lookups
- **Usage Tracking**: Simple monthly counters
- **Search**: Basic text search (could be enhanced with ElasticSearch)
- **Scalability**: Ready for millions of users

## Next Steps

1. **Test All Functionality**: Verify user registration, login, recipes, etc.
2. **Optimize Queries**: Review access patterns and add GSIs if needed
3. **Add Monitoring**: CloudWatch metrics for performance tracking
4. **Consider Search Enhancement**: ElasticSearch integration for advanced recipe search
5. **Data Migration Script**: If migrating from existing PostgreSQL data

The migration to DynamoDB positions FlavorBot as a modern, scalable, cloud-native application ready for rapid growth and deployment across multiple environments.