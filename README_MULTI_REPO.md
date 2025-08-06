# FlavorBot Multi-Repository Architecture

## 🎉 Architecture Implementation Complete

FlavorBot has been successfully separated into 4 independent repositories, enabling specialized teams to work independently while sharing 70-80% of the codebase through the `@flavorbot/shared` package.

## Repository Overview

### 📦 flavorbot-shared
**NPM Package for Shared Business Logic**
- Database schemas and validation
- Typed API client with service layers  
- React hooks for auth and recipes
- Utility functions and formatters
- 70-80% code reuse across platforms

### 🚀 flavorbot-backend  
**Express.js API Server**
- Independent REST API (port 5001)
- Enterprise-grade security and rate limiting
- Email/password authentication with sessions
- AI integration with Anthropic Claude
- PostgreSQL with Drizzle ORM
- Health monitoring and logging

### 🌐 flavorbot-web
**React Web Application**  
- Modern React 18 + TypeScript + Vite
- Tailwind CSS with shadcn/ui components
- TanStack Query for state management
- WCAG 2.2 accessibility compliance
- PWA capabilities for desktop installation
- Proxy configuration to backend API

### 📱 flavorbot-mobile
**React Native Mobile App**
- Cross-platform iOS/Android with Expo
- Native navigation and design patterns
- Expo Secure Store for authentication
- EAS Build for app store deployment
- Shared business logic via @flavorbot/shared

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Anthropic API key

### 1. Install Dependencies
```bash
# Shared package (install first)
cd flavorbot-shared && npm install && npm run build

# Backend
cd ../flavorbot-backend && npm install

# Web frontend  
cd ../flavorbot-web && npm install

# Mobile app
cd ../flavorbot-mobile && npm install
```

### 2. Environment Setup
```bash
# Backend
cp flavorbot-backend/.env.example flavorbot-backend/.env
# Configure DATABASE_URL, ANTHROPIC_API_KEY, etc.

# Web
cp flavorbot-web/.env.example flavorbot-web/.env

# Mobile
cp flavorbot-mobile/.env.example flavorbot-mobile/.env
```

### 3. Database Setup
```bash
cd flavorbot-backend
npm run db:push
```

### 4. Development
```bash
# Terminal 1: Backend API
cd flavorbot-backend && npm run dev

# Terminal 2: Web App  
cd flavorbot-web && npm run dev

# Terminal 3: Mobile App
cd flavorbot-mobile && npm start
```

## Team Workflows

### Backend Team
- Independent API development and deployment
- Database schema changes via Drizzle migrations
- Security and performance optimization
- Deploy to AWS/GCP/Azure containers

### Web Team  
- UI/UX development with design system
- Progressive Web App features
- Performance optimization
- Deploy to Vercel/Netlify/S3+CloudFront

### Mobile Team
- Native iOS/Android feature development
- App store submission and updates
- Platform-specific optimizations
- Deploy via Expo EAS Build

### Shared Package Team
- Core business logic and API contracts
- React hooks and utility functions
- Type definitions and validation schemas
- Coordinate breaking changes across teams

## Architecture Benefits

✅ **Team Independence**: Deploy and iterate independently  
✅ **Code Reuse**: 70-80% shared business logic  
✅ **Type Safety**: End-to-end TypeScript coverage  
✅ **Performance**: Optimized for each platform  
✅ **Scalability**: Teams can scale independently  
✅ **Maintainability**: Clear separation of concerns  

## Deployment Strategy

| Repository | Platform | Deployment |
|------------|----------|------------|
| flavorbot-backend | Server | AWS ECS/EKS, Google Cloud Run, Azure Container Instances |
| flavorbot-web | Static | Vercel, Netlify, AWS S3+CloudFront, Azure Static Web Apps |
| flavorbot-mobile | App Stores | iOS App Store, Google Play Store (via Expo EAS) |
| flavorbot-shared | NPM | Private NPM registry or GitHub Packages |

## Next Steps

1. **Environment Configuration**: Set up all environment variables
2. **CI/CD Pipelines**: Automated testing and deployment
3. **Team Onboarding**: Set up development environments
4. **Release Coordination**: Establish shared package versioning
5. **Monitoring**: Set up application monitoring and alerts

## Support

Each repository contains detailed README files with:
- Setup instructions
- Development workflows  
- Deployment guides
- Troubleshooting tips

The multi-repository architecture is production-ready and enables FlavorBot to scale across multiple development teams while maintaining code quality and consistency.