# FlavorBot Recipe Application

## Overview

FlavorBot is a full-stack web application that serves as an AI-powered recipe assistant. The application allows users to discover, save, and organize recipes with the help of AI-generated content and personalized recommendations. It features a modern React frontend with a shadcn/ui component library and an Express.js backend with PostgreSQL database storage.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Component Library**: Radix UI primitives with custom theming

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful API design
- **Session Management**: Express sessions with PostgreSQL storage
- **File Structure**: Modular route handlers and services

### Database Architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations
- **Tables**: Users, recipes, chat conversations, usage tracking, and sessions

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store
- **User Management**: Complete user profile system with preferences
- **Security**: Secure session handling with httpOnly cookies

### AI Integration
- **Provider**: Anthropic Claude Sonnet 4.0 model
- **Features**: Recipe generation, chat assistant, personalized recommendations
- **Response Format**: Structured JSON responses for recipes
- **Usage Tracking**: Monthly usage limits and tracking

### Recipe Management
- **CRUD Operations**: Full recipe lifecycle management
- **Categorization**: Breakfast, lunch, dinner, and snacks
- **Search**: Text-based recipe search functionality
- **Sharing**: Email and SMS sharing capabilities

### User Interface
- **Design System**: shadcn/ui with consistent theming
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System and user preference-based theming
- **Navigation**: Persistent navigation with route-based highlighting

## Data Flow

### User Authentication Flow
1. User initiates login through Replit Auth
2. OAuth flow redirects to provider and back
3. Session created and stored in PostgreSQL
4. User data synchronized with database
5. Frontend receives authenticated user state

### Recipe Generation Flow
1. User submits prompt to AI chatbot
2. Request sent to Anthropic Claude API with structured prompt
3. AI response parsed and validated
4. Recipe saved to database with user association
5. Frontend updates with new recipe data

### Data Persistence Flow
1. All user data stored in PostgreSQL
2. Real-time updates through React Query
3. Optimistic updates for better UX
4. Error handling with rollback capabilities

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL hosting
- **Connection Pooling**: Built-in connection management
- **SSL**: Secure database connections

### AI Services
- **Anthropic Claude**: Sonnet 4.0 model for recipe generation
- **Rate Limiting**: Usage tracking and monthly limits
- **Structured Outputs**: JSON-formatted responses

### Communication Services
- **Nodemailer**: Email sharing functionality
- **Twilio**: SMS sharing capabilities (optional)
- **SMTP**: Configurable email service provider

### Authentication
- **Replit Auth**: OAuth 2.0 / OpenID Connect
- **Session Management**: Secure session handling
- **Profile Data**: Automatic profile synchronization

## Deployment Strategy

### Development Environment
- **Platform**: Replit development environment
- **Hot Reload**: Vite development server
- **Database**: Shared development database
- **Environment Variables**: Replit secrets management

### Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite production build + esbuild server bundle
- **Static Assets**: Served from Express.js
- **Database**: Production PostgreSQL instance
- **SSL**: Automatic HTTPS termination

### Environment Configuration
- **Development**: `npm run dev` - concurrent client/server
- **Production**: `npm run build && npm run start`
- **Database Migrations**: `npm run db:push`
- **Port Configuration**: 5000 internal, 80 external

## Changelog
```
Changelog:
- June 23, 2025: Initial setup with complete FlavorBot application
- Added recipe sharing via email and SMS functionality
- Updated AI service to use Anthropic Claude instead of OpenAI
- June 24, 2025: Cleaned up codebase - removed unused OpenAI dependency and renamed files for clarity
- Fixed AI response parsing for JSON wrapped in markdown
- Added 4 sample recipes for immediate use
- Created manual recipe creation modal with dynamic ingredients/instructions
- Fixed Save Recipe button visibility and CSS rendering issues
- Confirmed recipe creation functionality working properly
- Implemented profile photo upload with file validation and preview
- Fixed all Save Recipe button CSS issues in both modal and chatbot
- Added multer file upload handling with secure storage
- June 24, 2025: Updated main page layout to display action cards in horizontal row
- Fixed SVG icon visibility issues across all action cards
- Implemented dynamic Total Recipes count display that updates in real-time
- Streamlined navigation to icon-only design with "Add Recipe" functionality
- Fixed card highlighting issues and improved visual consistency
- Improved "Start Cooking Today" button visibility and removed demo functionality
- Implemented session-based chat system with 7-day automatic cleanup
- Each FlavorBot visit starts a new session while maintaining conversation continuity
- Welcome message only shows for first-time users, not on every new session
- Fixed rate limiting issue - updated user to pro tier for unlimited recipe generation
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```