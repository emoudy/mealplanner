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
- **Backend:** Express.js, TypeScript, PostgreSQL, Drizzle ORM, Dual authentication system (email/password + Replit OAuth), Session-based authentication, Passport.js.
- **AI Integration:** Anthropic Claude for intelligent recipe generation, context-aware chatbot, natural language parsing.
- **State Management:** TanStack Query (server state), React Context (authentication, themes), React hooks (local state).

**Key Features:**
- AI-powered recipe generation and recommendations.
- Recipe collection management (save, edit, delete, categorize).
- Interactive chatbot for culinary assistance with intelligent suggestion routing.
- **Universal Authentication System:** Email/password registration and login for worldwide accessibility.
- Email verification system with professional email templates and verification flow.
- Responsive design with dark/light theme support.
- Search and filter functionality.
- Recipe sharing capabilities (requires email verification).
- Dynamic suggestion buttons and structured AI responses.
- Session-based suggestion persistence and complete 12-suggestion display.
- Subscription tiers controlling recipe generation limits (Free, Basic, Pro).
- Full recipe detail viewing with modal interface.
- Simplified recipe editing with numbered text instructions.
- Smart suggestion button behavior (category vs. recipe generation).
- Enhanced recipe save functionality from AI-generated recipes.

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
- **Authentication:** Passport.js with Local Strategy (email/password) for universal access
- **Email Service:** Configurable SMTP (Gmail, SendGrid, etc.) for verification emails
- **Session Management:** PostgreSQL-backed sessions with connect-pg-simple
- **Password Security:** Node.js crypto with scrypt hashing and salt
- **Deployment:** Replit (for web and backend), Expo EAS Build (for mobile iOS/Android app stores)

## Recent Architectural Changes (August 2025)
- **Simplified Authentication System:** Removed complex Replit OAuth and implemented clean email/password authentication for universal access.
- **Database Schema Updates:** Added `password`, `authProvider` fields to users table for email/password authentication.
- **Email Verification System:** Complete email verification workflow with professional templates and security tokens.
- **Authentication UI/UX:** Clean `/auth` page with tabbed login/registration forms, removed Replit-specific elements.
- **Session Management:** PostgreSQL-backed sessions with Passport.js LocalStrategy for secure authentication.
- **Universal Access:** FlavorBot now serves all users worldwide, not limited to Replit customers.