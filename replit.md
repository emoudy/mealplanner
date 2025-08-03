# FlavorBot - AI-Powered Recipe Management Platform

## Project Overview
A comprehensive AI-powered recipe management platform that leverages advanced language models to generate, personalize, and assist users in their culinary journey.

## Project Architecture

### Cross-Platform Monorepo Structure
FlavorBot has been restructured as a comprehensive cross-platform application with 70-80% code sharing between web, desktop (PWA), and mobile platforms:

```
/
├── packages/
│   ├── shared/              # Core business logic package (70-80% code reuse)
│   │   ├── src/
│   │   │   ├── api/         # API client with unified fetch wrapper
│   │   │   ├── hooks/       # React hooks for auth, recipes, chatbot
│   │   │   ├── types/       # TypeScript interfaces and schemas
│   │   │   └── index.ts     # Public API exports
│   │   └── package.json     # Standalone npm package
│   └── mobile/              # React Native app (Expo)
│       ├── src/
│       │   ├── screens/     # Native screen components
│       │   ├── contexts/    # Authentication & theme contexts
│       │   └── components/  # Mobile-specific UI components
│       ├── App.tsx          # Main mobile app entry point
│       └── app.json         # Expo configuration
├── client/                  # React web application
│   ├── src/
│   │   ├── pages/          # Web-specific page components
│   │   ├── components/     # Web UI components (shadcn/ui)
│   │   └── hooks/          # Web-specific hooks
│   └── index.html          # Web app entry point
├── server/                  # Express.js backend (serves all platforms)
│   ├── routes.ts           # RESTful API endpoints
│   ├── storage.ts          # Database abstraction layer
│   └── index.ts            # Server entry point
└── shared/
    └── schema.ts           # Database schema (Drizzle ORM)
```

### Technology Stack
- **Shared Core (@flavorbot/shared)**: 
  - TypeScript for type safety across platforms
  - TanStack Query for unified server state management
  - Zod validation for consistent data schemas
  - Reusable business logic and API clients
- **Web Platform**: 
  - React.js with Vite for fast development
  - Tailwind CSS + shadcn/ui for consistent design system
  - Progressive Web App (PWA) capabilities for desktop installation
  - Wouter for lightweight client-side routing
- **Mobile Platform**: 
  - React Native with Expo for native app development
  - Native navigation and platform-specific APIs
  - Expo Secure Store for authentication persistence
  - Platform-optimized UI components
- **Backend (Universal)**: 
  - Express.js with TypeScript serving all platforms
  - PostgreSQL with Drizzle ORM for type-safe database operations
  - Session-based authentication with OAuth 2.0
  - RESTful API design compatible with web and mobile
- **AI Integration**: 
  - Anthropic Claude for intelligent recipe generation
  - Context-aware chatbot assistance
  - Natural language recipe parsing and suggestions
- **State Management**: 
  - TanStack Query for server state (shared across platforms)
  - React Context for authentication and themes
  - Local state management with React hooks
- **Deployment Strategy**: 
  - **Web**: Replit with automatic deployments and PWA support
  - **Desktop**: Browser-based PWA installation
  - **Mobile**: iOS/Android app stores via Expo EAS Build

### Key Features
- AI-powered recipe generation and recommendations
- Recipe collection management (save, edit, delete, categorize)
- Interactive chatbot for culinary assistance
- User authentication and personalized experience
- Responsive design with dark/light theme support
- Search and filter functionality
- Recipe sharing capabilities

## Accessibility Implementation (WCAG 2.2 Compliance)

### Recent Accessibility Improvements
**Date**: 2025-01-02

Implemented comprehensive WCAG 2.2 accessibility compliance including:

#### 1. Semantic HTML Structure
- Added proper semantic elements (`<header>`, `<main>`, `<section>`, `<nav>`)
- Used appropriate heading hierarchy (h1, h2, h3) with proper nesting
- Added skip navigation link for keyboard users

#### 2. ARIA Roles and Attributes
- Navigation with `role="navigation"` and `aria-label`
- Form controls with proper `aria-required`, `aria-describedby`, `aria-invalid`
- Interactive elements with `aria-label` and `aria-pressed` where appropriate
- Live regions with `aria-live="polite"` for dynamic content updates
- Tab panels with proper `role="tabpanel"` and `aria-controls`

#### 3. Color Contrast and Visual Design
- Updated color palette to meet WCAG AA contrast ratios (4.5:1 minimum)
- Added support for high contrast mode with `@media (prefers-contrast: high)`
- Improved focus indicators with visible outline styles
- Added `aria-hidden="true"` to decorative icons

#### 4. Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus management with proper tabindex usage
- Added keyboard event handlers for custom interactive components
- Skip link implementation for main content access

#### 5. Screen Reader Support
- Screen reader only content with `.sr-only` class
- Proper labeling of form controls and interactive elements
- Error messages with `role="alert"` and proper associations
- Descriptive alt text and aria-labels throughout

#### 6. Form Accessibility
- Labels properly associated with form controls
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required="true"`
- Input validation states with `aria-invalid`
- Helper text provided for complex form fields

#### 7. Responsive and Adaptive Features
- Support for reduced motion with `@media (prefers-reduced-motion: reduce)`
- Flexible layouts that work across all viewport sizes
- Touch-friendly target sizes (minimum 44px)

### Accessibility Components
- Created `AccessibilityAnnouncement` component for screen reader notifications
- Enhanced existing UI components with proper ARIA attributes
- Added accessibility-focused CSS utilities

## User Preferences
- Clean, modern interface with intuitive navigation
- Fast, responsive interactions
- Comprehensive accessibility support
- Professional, helpful tone in AI interactions

## Development Guidelines
- Follow the fullstack_js development pattern
- Use TypeScript for type safety
- Implement proper error handling and loading states
- Maintain accessibility standards in all new features
- Test with keyboard navigation and screen readers
- Ensure color contrast meets WCAG AA standards

## Recent Changes

### **2025-08-03**: Cross-Platform Architecture Implementation Complete
- **Monorepo Structure**: Restructured entire codebase into cross-platform monorepo
- **Shared Package (@flavorbot/shared)**: 
  - Extracted core business logic achieving 70-80% code reuse
  - Unified API client with consistent error handling
  - Shared React hooks for authentication, recipes, and chatbot
  - Common TypeScript types and Zod validation schemas
- **Mobile Application**: 
  - Built comprehensive React Native app with Expo
  - Implemented native screens for all major features
  - Added authentication and theme contexts with secure storage
  - Created mobile-optimized navigation and UI components
- **Web Application Enhancement**: 
  - Integrated shared package for consistent logic
  - Maintained existing shadcn/ui design system
  - Added Progressive Web App (PWA) capabilities
  - Preserved WCAG 2.2 accessibility compliance
- **Backend Optimization**: 
  - Enhanced Express.js API to serve both web and mobile platforms
  - Improved session management and authentication flow
  - Added comprehensive error handling and validation

### **2025-01-02**: WCAG 2.2 Accessibility Implementation
- Implemented comprehensive accessibility features across all components
- Added semantic HTML structure and ARIA attributes
- Enhanced keyboard navigation and screen reader support
- Ensured color contrast compliance and responsive design

### Architecture Benefits
- **Code Reuse**: 70-80% of business logic shared between platforms
- **Consistency**: Unified data models and API interactions
- **Maintainability**: Single source of truth for core functionality
- **Scalability**: Easy addition of new platforms (desktop, tablet)
- **Developer Experience**: Efficient cross-platform development workflow

## Database Schema
Located in `shared/schema.ts` with proper TypeScript interfaces and Drizzle ORM integration.

## API Structure
RESTful API with proper error handling, authentication middleware, and input validation.

## Deployment
Configured for automatic deployment on Replit with environment variable management for API keys and database connections.