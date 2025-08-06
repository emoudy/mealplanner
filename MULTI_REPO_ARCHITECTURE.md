# FlavorBot Multi-Repository Architecture Plan

## Current Monorepo Structure
```
FlavorBot/
├── client/          # React web application
├── server/          # Express.js backend
├── shared/          # Shared types and schemas
├── package.json     # Monorepo dependencies
└── ...config files
```

## Proposed Multi-Repository Structure

### 1. flavorbot-shared (NPM Package)
**Repository:** `flavorbot-shared`
**Team:** Backend + Frontend teams (shared ownership)
**Purpose:** Shared code between web and mobile applications

```
flavorbot-shared/
├── src/
│   ├── types/           # TypeScript interfaces
│   ├── schemas/         # Zod validation schemas  
│   ├── utils/           # Shared utility functions
│   ├── api-client/      # API client with typed endpoints
│   ├── hooks/           # Shared React hooks
│   └── constants/       # Shared constants
├── package.json         # NPM package configuration
├── tsconfig.json
└── README.md
```

**Key Exports:**
- Database schemas (Drizzle + Zod)
- API request/response types
- Validation schemas
- Common utilities (formatters, validators)
- TanStack Query hooks
- API client with typed endpoints

### 2. flavorbot-backend
**Repository:** `flavorbot-backend`
**Team:** Backend team
**Purpose:** Express.js API server

```
flavorbot-backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── auth/            # Authentication logic
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic services
│   ├── storage/         # Database access layer
│   ├── security/        # Security configurations
│   └── utils/           # Backend-specific utilities
├── tests/
├── package.json
├── drizzle.config.ts
├── Dockerfile
└── README.md
```

**Dependencies:**
- `@flavorbot/shared` (shared schemas and types)
- Express.js ecosystem
- Database drivers
- Authentication libraries

### 3. flavorbot-web
**Repository:** `flavorbot-web`
**Team:** Frontend team
**Purpose:** React web application

```
flavorbot-web/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts
│   ├── lib/             # Web-specific utilities
│   └── assets/          # Static assets
├── public/
├── tests/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

**Dependencies:**
- `@flavorbot/shared` (shared hooks, types, API client)
- React ecosystem
- UI libraries (shadcn/ui, Tailwind)
- Build tools (Vite)

### 4. flavorbot-mobile
**Repository:** `flavorbot-mobile`
**Team:** Mobile team
**Purpose:** React Native mobile application

```
flavorbot-mobile/
├── src/
│   ├── components/      # React Native components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── contexts/        # React contexts
│   └── utils/           # Mobile-specific utilities
├── android/
├── ios/
├── tests/
├── package.json
├── app.json
└── README.md
```

**Dependencies:**
- `@flavorbot/shared` (shared hooks, types, API client)
- React Native ecosystem
- Expo tools
- Native modules

## Migration Strategy

### Phase 1: Extract Shared Package
1. Create `flavorbot-shared` repository
2. Move shared code from current `/shared` directory
3. Add API client and shared hooks
4. Publish as NPM package
5. Update current monorepo to use published package

### Phase 2: Separate Backend
1. Create `flavorbot-backend` repository
2. Move `/server` directory contents
3. Update to use `@flavorbot/shared` package
4. Set up CI/CD pipeline
5. Deploy backend independently

### Phase 3: Separate Frontend
1. Create `flavorbot-web` repository
2. Move `/client` directory contents
3. Update to use `@flavorbot/shared` package
4. Set up build and deployment pipeline

### Phase 4: Create Mobile App
1. Create `flavorbot-mobile` repository
2. Initialize React Native project with Expo
3. Implement mobile-specific UI components
4. Use `@flavorbot/shared` for business logic
5. Set up mobile CI/CD

## Development Workflow

### Shared Package Updates
1. Make changes in `flavorbot-shared`
2. Version and publish to NPM
3. Update dependent repositories
4. Test integration across all apps

### Independent Development
- Each team can work independently on their repository
- Shared package provides consistency
- API contract defined in shared package
- Version control ensures compatibility

### Cross-Platform Consistency
- Shared business logic in `@flavorbot/shared`
- Consistent API client usage
- Shared validation schemas
- Common data models

## Benefits

1. **Team Independence**: Each team works on their own codebase
2. **Code Reuse**: 70-80% code sharing via `@flavorbot/shared`
3. **Separate Deployments**: Independent deployment pipelines
4. **Clear Boundaries**: Well-defined responsibilities
5. **Scalable Architecture**: Easy to add new platforms
6. **Version Control**: Clear versioning for shared components

## Implementation Status

### ✅ Phase 1: Extract Shared Package - COMPLETED
- Created `flavorbot-shared` package with complete structure
- Extracted database schemas and validation logic
- Built typed API client with service layers
- Added React hooks for authentication and recipes
- Created utility functions and formatters
- Set up TypeScript compilation and exports
- Updated main project to use `@flavorbot/shared`

### 🚀 Ready for Phase 2: Separate Backend
The shared package is now ready and functional. The next step is to create the backend repository and migrate the server code.

### Benefits Already Achieved
- 📦 **Reusable Package**: Complete shared codebase in `@flavorbot/shared`
- 🔧 **Type Safety**: Full TypeScript support across all modules
- 🎯 **API Client**: Ready-to-use service layer for frontend teams
- 🎣 **React Hooks**: Shared data fetching logic with TanStack Query
- 📐 **Constants**: Centralized configuration and limits
- 🛠️ **Utilities**: Common formatters and validators

The foundation for team independence is now established!