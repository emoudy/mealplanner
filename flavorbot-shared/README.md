# @flavorbot/shared

Shared business logic, types, and utilities for FlavorBot cross-platform applications.

## Features

- 🔄 **Cross-Platform API Client** - Works on web, mobile, and desktop
- 🎣 **React Hooks** - Authentication, recipes, chatbot, and usage stats
- 📝 **TypeScript Types** - Comprehensive type definitions
- ✅ **Validation** - Zod schemas for data validation
- 🔧 **Platform Utilities** - Platform detection and feature flags

## Installation

```bash
npm install @flavorbot/shared
```

## Usage

### API Client

```typescript
import { apiClient } from '@flavorbot/shared';

// Get recipes
const recipes = await apiClient.get('/api/recipes');

// Create recipe
const newRecipe = await apiClient.post('/api/recipes', {
  title: 'Pasta Carbonara',
  ingredients: ['pasta', 'eggs', 'cheese'],
  // ...
});
```

### Authentication Hook

```typescript
import { useAuth } from '@flavorbot/shared';

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Recipe Management

```typescript
import { useRecipes, useCreateRecipe } from '@flavorbot/shared';

function RecipeList() {
  const { data: recipes, isLoading } = useRecipes();
  const createRecipe = useCreateRecipe();

  const handleCreate = (formData) => {
    createRecipe.mutate(formData, {
      onSuccess: () => {
        console.log('Recipe created!');
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {recipes.map(recipe => (
        <div key={recipe.id}>{recipe.title}</div>
      ))}
    </div>
  );
}
```

### Chatbot Integration

```typescript
import { useChatbot } from '@flavorbot/shared';

function ChatInterface() {
  const { messages, sendMessage, isTyping } = useChatbot();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <strong>{message.role}:</strong> {message.content}
        </div>
      ))}
      {isTyping && <div>Bot is typing...</div>}
      <button onClick={() => sendMessage('Hello!')}>
        Send Message
      </button>
    </div>
  );
}
```

### Platform Detection

```typescript
import { detectPlatform, getFeatures } from '@flavorbot/shared';

const platform = detectPlatform(); // 'web' | 'mobile' | 'desktop'
const features = getFeatures();

if (features.hasCamera) {
  // Show camera functionality
}

if (features.canInstallPWA) {
  // Show PWA install prompt
}
```

### Validation

```typescript
import { validateRecipeForm, recipeFormSchema } from '@flavorbot/shared';

const result = validateRecipeForm({
  title: 'Pasta',
  ingredients: ['pasta', 'sauce'],
  instructions: ['Boil pasta', 'Add sauce'],
  category: 'dinner',
  cookTime: 15,
  servings: 2,
});

if (result.success) {
  // Data is valid
  console.log(result.data);
} else {
  // Handle validation errors
  console.log(result.error.errors);
}
```

## Platform Support

This package is designed to work across multiple platforms:

- **Web** - React web applications
- **Mobile** - React Native applications
- **Desktop** - Electron or Tauri applications

The API client automatically detects the platform and adjusts behavior accordingly.

## TypeScript

This package is written in TypeScript and provides comprehensive type definitions. All hooks and utilities are fully typed.

```typescript
import type { Recipe, AuthUser, ChatMessage } from '@flavorbot/shared';
```

## Requirements

- React 18+
- TypeScript 5+
- TanStack Query 5+

## License

MIT