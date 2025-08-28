# MealPlanner Backend Refactoring Guide

This document shows you how to migrate your current 739-line `server/routes.ts` file into the domain-organized structure we discussed.

## 🏗️ Folder Structure Created

```
mealplanner-backend/
├── src/
│   ├── shared/
│   │   ├── config/
│   │   │   └── index.ts              ✅ Created - Environment config
│   │   ├── errors/
│   │   │   └── app-error.ts          ✅ Created - Error handling
│   │   ├── services/
│   │   │   ├── logger.ts             ✅ Created - Structured logging
│   │   │   ├── notifications/
│   │   │   │   ├── email.ts          ✅ Created - Email service (lines 14-22 + 431-448)
│   │   │   │   └── sms.ts            ✅ Created - SMS service (lines 24-28)
│   │   │   └── upload/
│   │   │       └── upload.ts         ✅ Created - File upload (lines 32-57)
│   │   └── container.ts              ✅ Created - Dependency injection
│   ├── domains/
│   │   ├── users/
│   │   │   ├── routes.ts             ✅ Created - User routes (lines 67-118, 401-484)
│   │   │   └── service.ts            ✅ Created - User business logic
│   │   ├── recipes/                  📁 Ready for migration (lines 123-198, 485-558)
│   │   ├── ai-chat/                  📁 Ready for migration (lines 202-389)
│   │   ├── meal-planning/            📁 Ready for migration (lines 559-617)
│   │   └── grocery/                  📁 Ready for migration (lines 619-739)
│   └── index.ts                      📝 Ready to create main app
```

## 📋 Migration Checklist

### ✅ Completed
1. **Shared Infrastructure**
   - Config management with environment validation
   - Error handling with structured logging
   - Email service (extracted from lines 14-22, 431-448)
   - SMS service (extracted from lines 24-28)
   - Upload service (extracted from lines 32-57)
   - Service container for dependency injection

2. **User Domain**
   - User service with business logic
   - User routes (extracted from lines 67-118, 401-484)
   - Email verification flow

### 🚧 Next Steps

1. **Create Recipe Domain**
   ```typescript
   // src/domains/recipes/service.ts - Extract lines 123-198, 485-558
   export class RecipeService {
     async getRecipesByUser(userId: string, category?: string) { /* Line 123 */ }
     async createRecipe(userId: string, recipeData: any) { /* Line 133 */ }
     async shareRecipeViaEmail(recipeId: number, email: string) { /* Line 485 */ }
   }
   
   // src/domains/recipes/routes.ts - Recipe endpoints
   router.get('/recipes', ...)
   router.post('/recipes', ...)
   router.post('/recipes/:id/share/email', ...)
   ```

2. **Create AI/Chat Domain**
   ```typescript
   // src/domains/ai-chat/service.ts - Extract lines 202-389
   export class AIService {
     async generateRecipe(prompt: string, userId: string) { /* Line 202 */ }
     async getChatResponse(messages: any[], userId: string) { /* Line 280 */ }
   }
   ```

3. **Create Other Domains**
   - Meal Planning (lines 559-617)
   - Grocery (lines 619-739)

## 🔧 Implementation Guide

### Step 1: Update your existing server/routes.ts
Add this at the top to start using the new structure:

```typescript
// server/routes.ts - Add this import
import { createUserRoutes } from '../mealplanner-backend/src/domains/users/routes.js';
import { ServiceContainer } from '../mealplanner-backend/src/shared/container.js';

export async function registerRoutes(app: Express): Promise<Server> {
  await setupEmailAuth(app);
  
  // NEW: Use domain-organized routes
  const container = new ServiceContainer();
  app.use('/api', createUserRoutes(container, dbStorage, isAuthenticated));
  
  // EXISTING: Keep other routes until migrated
  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    // Your existing recipe logic...
  });
  
  // ... rest of your routes
}
```

### Step 2: Test the User Domain
The user-related endpoints should now work through the new domain structure:
- `GET /api/auth/user`
- `GET /api/user`
- `PATCH /api/user/profile`
- `POST /api/user/upload-photo`
- `POST /api/auth/send-verification`

### Step 3: Migrate Remaining Domains
Follow the same pattern for recipes, AI, meal planning, and grocery domains.

## 🎯 Benefits Achieved

### ✅ Organization
- **739-line monolith** → **Focused domain files** (~50-100 lines each)
- **Mixed concerns** → **Clear domain boundaries**
- **Scattered config** → **Centralized configuration**

### ✅ Maintainability
- **Structured error handling** with proper logging context
- **Dependency injection** for easy testing
- **Service layer** separating business logic from routes

### ✅ Scalability
- **Easy microservices extraction** - each domain folder becomes a service
- **Independent development** - teams can work on different domains
- **Shared infrastructure** that can become external services

## 🚀 Running the New Structure

1. Install dependencies in the backend:
   ```bash
   cd mealplanner-backend
   npm install
   ```

2. Build the shared package:
   ```bash
   cd ../mealplanner-shared
   npm run build
   ```

3. Start the backend in development:
   ```bash
   cd ../mealplanner-backend
   npm run dev
   ```

## 📝 Notes

- Your existing functionality is preserved
- Migration can be done incrementally
- Each domain is ready for future microservices extraction
- Shared services handle cross-cutting concerns properly
- Configuration is centralized and validated

The foundation is now set for a maintainable, scalable distributed monolith!
