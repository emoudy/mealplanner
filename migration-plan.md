# FlavorBot Multi-Repo Migration Plan

## Phase 1: Shared Package Creation ✅ COMPLETED
- [x] Created `@flavorbot/shared` package with all common business logic
- [x] Extracted API client, hooks, types, and utilities
- [x] Built TypeScript definitions and distribution files
- [x] Created comprehensive documentation

## Phase 2: Repository Structure Creation 🔄 IN PROGRESS

### New Repository Structure:
```
flavorbot-shared/       # Standalone npm package
├── src/
│   ├── api/           # Cross-platform API client
│   ├── hooks/         # React hooks for all platforms
│   ├── types/         # TypeScript definitions
│   └── utils/         # Shared utilities
├── dist/              # Built package
└── package.json       # Published to npm

flavorbot-web/         # React web application
├── src/
│   ├── pages/         # Web-specific pages
│   ├── components/    # Web UI components (shadcn/ui)
│   └── hooks/         # Web-specific hooks
├── public/            # Static assets
└── package.json       # Depends on @flavorbot/shared

flavorbot-mobile/      # React Native mobile app
├── src/
│   ├── screens/       # Mobile screens
│   ├── components/    # Native components
│   └── contexts/      # Mobile contexts
├── app.json           # Expo configuration
└── package.json       # Depends on @flavorbot/shared

flavorbot-backend/     # Express.js API server
├── src/
│   ├── routes/        # API endpoints
│   ├── middleware/    # Express middleware
│   └── database/      # Database layer
└── package.json       # Independent backend
```

## Phase 3: Web Application Migration
- [ ] Copy web-specific files to `flavorbot-web/`
- [ ] Update imports to use `@flavorbot/shared`
- [ ] Configure Vite and build tools
- [ ] Test web application functionality

## Phase 4: Mobile Application Migration
- [ ] Copy mobile-specific files to `flavorbot-mobile/`
- [ ] Update imports to use `@flavorbot/shared`
- [ ] Configure Expo and React Native setup
- [ ] Test mobile application functionality

## Phase 5: Backend Migration
- [ ] Copy server files to `flavorbot-backend/`
- [ ] Configure database and environment setup
- [ ] Set up deployment configuration
- [ ] Test API endpoints

## Phase 6: CI/CD and Deployment
- [ ] Set up GitHub Actions for each repository
- [ ] Configure automated testing
- [ ] Set up deployment pipelines
- [ ] Configure dependency management between repos

## Benefits of Multi-Repo Architecture:

### Development Benefits:
- **Independent Development**: Teams can work on different platforms simultaneously
- **Focused Codebase**: Each repo contains only relevant code for its platform
- **Technology Flexibility**: Each platform can use optimal tools and dependencies
- **Faster Builds**: No need to build unused platform code

### Deployment Benefits:
- **Independent Releases**: Web can deploy multiple times daily, mobile follows app store cycles
- **Reduced Risk**: Issues in one platform don't affect others
- **Platform Optimization**: Each app can be optimized for its environment
- **Easier Scaling**: Different platforms can scale independently

### Maintenance Benefits:
- **Clear Ownership**: Teams have clear responsibility boundaries
- **Easier Debugging**: Issues are isolated to specific platforms
- **Simpler Dependencies**: Each repo has only necessary dependencies
- **Better Documentation**: Platform-specific docs and README files

## Code Sharing Strategy:
- **@flavorbot/shared** package maintains 70-80% code reuse
- **Semantic versioning** for shared package updates
- **Automated dependency updates** across repositories
- **Shared CI/CD** patterns and configurations

## Migration Timeline:
- **Week 1**: Complete shared package and web migration
- **Week 2**: Complete mobile and backend migrations
- **Week 3**: Set up CI/CD and deployment pipelines
- **Week 4**: Testing, documentation, and team training

## Next Steps:
1. Complete web application migration
2. Test web app with shared package
3. Migrate mobile application
4. Set up backend repository
5. Configure deployment pipelines