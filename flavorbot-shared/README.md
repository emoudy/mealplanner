# @flavorbot/shared

Shared code between FlavorBot web and mobile applications, providing consistent business logic, type definitions, API clients, and utilities.

## Features

- 🔧 **Database Schemas** - Drizzle ORM schemas with Zod validation
- 🎯 **Type Safety** - Complete TypeScript type definitions
- 🔗 **API Client** - Type-safe API client with service layers
- 🎣 **React Hooks** - Shared TanStack Query hooks for data fetching
- 🛠️ **Utilities** - Common formatters, validators, and helper functions
- 📐 **Constants** - Application constants and configuration

## Installation

```bash
npm install @flavorbot/shared
```

## Peer Dependencies

```bash
npm install react @tanstack/react-query zod
```

## Usage

### API Client

```typescript
import { createApiClient, FlavorBotApi } from "@flavorbot/shared/api-client";

const config = {
  apiUrl: "https://api.flavorbot.com",
  environment: "production",
  platform: "web"
};

const client = createApiClient(config);
const api = new FlavorBotApi(client);

// Use the API
const user = await api.auth.login({ email, password });
const recipes = await api.recipes.getRecipes();
```

### React Hooks

```typescript
import { useAuth, useRecipes } from "@flavorbot/shared/hooks";

function MyComponent() {
  const { user, login, isLoading } = useAuth();
  const { recipes, createRecipe } = useRecipes();

  // Component logic
}
```

### Schemas and Validation

```typescript
import { loginSchema, createRecipeSchema } from "@flavorbot/shared/schemas";
import type { User, Recipe } from "@flavorbot/shared/types";

// Validate data
const loginData = loginSchema.parse({ email, password });

// Use types
const user: User = { id: "123", email: "user@example.com", ... };
```

### Utilities

```typescript
import { formatCookTime, validatePasswordStrength } from "@flavorbot/shared/utils";

const cookTime = formatCookTime(90); // "1h 30m"
const strength = validatePasswordStrength("mypassword123"); // { isValid: false, ... }
```

### Constants

```typescript
import { API_ENDPOINTS, SUBSCRIPTION_LIMITS } from "@flavorbot/shared/constants";

const loginUrl = API_ENDPOINTS.AUTH.LOGIN; // "/api/login"
const freeLimit = SUBSCRIPTION_LIMITS.free.recipeQueries; // 50
```

## Module Structure

```
@flavorbot/shared/
├── schemas/         # Database schemas and validation
├── types/           # TypeScript type definitions
├── constants/       # Application constants
├── api-client/      # HTTP client and services
├── utils/           # Utility functions
└── hooks/           # React hooks
```

## Contributing

1. Make changes to the shared package
2. Update version in `package.json`
3. Build and publish: `npm run build && npm publish`
4. Update dependent repositories

## License

MIT License - see LICENSE file for details.