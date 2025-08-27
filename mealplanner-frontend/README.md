# MealPlanner Frontend

This directory contains all frontend applications and shared code for the MealPlanner project.

## Structure

```
mealplanner-frontend/
├── mealplanner-web/     # React web application
├── mealplanner-mobile/  # React Native mobile app
└── mealplanner-shared/  # Shared utilities, types, and components
```

## Quick Start

### Install all dependencies
```bash
npm run install:all
```

### Development
```bash
# Start web development server
npm run dev:web

# Start mobile development
npm run dev:mobile

# Build shared utilities (run this first if other apps depend on it)
npm run build:shared
```

### Build for Production
```bash
# Build all projects
npm run build:shared && npm run build:web && npm run build:mobile
```

## Projects

### Web Application (`mealplanner-web/`)
- React-based web application
- Vite for build tooling
- Tailwind CSS for styling
- TypeScript for type safety

### Mobile Application (`mealplanner-mobile/`)
- React Native application
- Expo for development and building
- Cross-platform (iOS & Android)
- Shared business logic with web app

### Shared Package (`mealplanner-shared/`)
- Common TypeScript types and interfaces
- Shared utility functions
- Validation schemas (Zod)
- API client configurations
- Reusable components and hooks

## Development Workflow

1. **Start with shared package**: If you're adding new types or utilities, start in `mealplanner-shared/`
2. **Build shared first**: Run `npm run build:shared` before starting other apps
3. **Parallel development**: You can run web and mobile simultaneously
4. **Hot reloading**: All applications support hot reloading during development

## Dependencies

- Each sub-project manages its own dependencies
- Shared dependencies are managed in the root `package.json`
- Use workspaces for efficient dependency management

## Scripts Reference

| Script | Description |
|--------|-------------|
| `install:all` | Install dependencies for all projects |
| `dev:web` | Start web development server |
| `dev:mobile` | Start mobile development with Expo |
| `dev:shared` | Start shared package in watch mode |
| `build:web` | Build web app for production |
| `build:mobile` | Build mobile app for production |
| `build:shared` | Build shared package |
| `lint` | Run linting on all projects |
| `test` | Run tests on all projects |
| `clean` | Remove all node_modules directories |
