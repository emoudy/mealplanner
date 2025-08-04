# FlavorBot - AI-Powered Recipe Management Platform

## Overview
FlavorBot is a comprehensive AI-powered recipe management platform designed to generate, personalize, and assist users in their culinary journey. The platform aims to be cross-platform, offering a unified experience across web, desktop (PWA), and mobile applications. Its core business vision is to provide an intuitive, intelligent, and accessible tool for users to manage their recipes, discover new ones through AI, and receive culinary assistance, thereby streamlining their cooking experience and fostering creativity in the kitchen.

## User Preferences
- Clean, modern interface with intuitive navigation
- Fast, responsive interactions
- Comprehensive accessibility support
- Professional, helpful tone in AI interactions

## System Architecture
FlavorBot is structured as a cross-platform application with a high degree of code sharing.

**Core Architectural Decisions:**
- **Monorepo Structure (Conceptual):** While the original project moved to a multi-repo, the underlying design principles still emphasize a shared core. A `packages/shared/` directory encapsulates 70-80% of reusable business logic, API clients, hooks, and types.
- **Universal Backend:** A single Express.js backend serves all platforms (web, mobile).
- **Client-Side Rendering:** React.js for web and React Native for mobile.
- **PWA First (Web):** The web application is designed with Progressive Web App capabilities for desktop installation.
- **Accessibility by Design:** Comprehensive WCAG 2.2 compliance is a core tenet, including semantic HTML, ARIA roles, color contrast, keyboard navigation, and screen reader support.
- **Modular Components:** UI components are built for reusability across platforms, leveraging libraries like shadcn/ui for web.
- **Session-Based Chat:** Chat conversations are session-based for optimized storage and performance.
- **Subscription Model:** Features are tiered (Free, Basic, Pro) based on recipe generation limits.

**Technology Stack:**
- **Shared Core (`@flavorbot/shared`):** TypeScript, TanStack Query (server state), Zod (validation).
- **Web Platform:** React.js, Vite, Tailwind CSS, shadcn/ui, Wouter (routing), PWA.
- **Mobile Platform:** React Native, Expo, Expo Secure Store.
- **Backend:** Express.js, TypeScript, PostgreSQL, Drizzle ORM, Session-based authentication, OAuth 2.0.
- **AI Integration:** Anthropic Claude for intelligent recipe generation, context-aware chatbot, natural language parsing.
- **State Management:** TanStack Query (server state), React Context (authentication, themes), React hooks (local state).

**Key Features:**
- AI-powered recipe generation and recommendations.
- Recipe collection management (save, edit, delete, categorize).
- Interactive chatbot for culinary assistance.
- User authentication and personalized experience.
- Responsive design with dark/light theme support.
- Search and filter functionality.
- Recipe sharing capabilities.
- Dynamic suggestion buttons and structured AI responses.
- Session-based suggestion persistence and complete 12-suggestion display.
- Subscription tiers controlling recipe generation limits (Free, Basic, Pro).

**UI/UX Decisions:**
- Clean, modern interface.
- Intuitive navigation.
- Responsive layouts for all viewport sizes.
- Dark/light theme support.
- Enhanced focus indicators for accessibility.
- Touch-friendly target sizes.

## External Dependencies
- **Database:** PostgreSQL (with Drizzle ORM)
- **AI Model:** Anthropic Claude
- **Authentication:** OAuth 2.0
- **Deployment:** Replit (for web and backend), Expo EAS Build (for mobile iOS/Android app stores)