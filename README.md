# 🍽️ MealPlanner - Distributed Monolith Architecture

A modern meal planning application with AI-powered recipe generation, built using a distributed monolith architecture pattern.

## 🏗️ Project Structure

```
mealplanner/
├── mealplanner-frontend/          # Frontend applications
│   ├── mealplanner-web/          # React web application  
│   ├── mealplanner-mobile/       # React Native mobile app
│   └── mealplanner-shared/       # Shared utilities & types
├── mealplanner-backend/           # Domain-organized backend
│   └── src/
│       ├── domains/              # Business domain routes
│       │   ├── users/           # User auth & profiles
│       │   ├── recipes/         # Recipe CRUD operations  
│       │   ├── ai-chat/         # AI recipe generation
│       │   ├── meal-planning/   # Meal plan management
│       │   ├── grocery/         # Grocery lists & items
│       │   └── notifications/   # Email/SMS notifications
│       ├── shared/              # Cross-cutting concerns
│       └── routes/              # Main route orchestration
├── mealplanner-infra/            # Infrastructure & deployment
│   ├── aws/                     # AWS CDK/CloudFormation
│   ├── docker/                  # Container configurations
│   ├── ci-cd/                   # Pipeline definitions
│   └── monitoring/              # Observability setup
└── server/                      # Legacy monolithic routes (deprecated)
```

## Overview
MealPlanner is a comprehensive AI-powered recipe management platform with secure email authentication and email verification. The platform provides recipe generation, management, and culinary assistance through an intelligent chatbot interface.

## Authentication System (Mock Email Service)
The app currently uses a mock email service for development. When you register:

1. **Registration**: Creates account but requires email verification
2. **Mock Email**: Verification details are logged to the server console
3. **Verification**: Use the logged token and URL to verify your account
4. **Login**: Only works after email verification

### Development Workflow
1. Register a new account through the `/auth` page
2. Check the server console for verification details
3. Visit the verification URL or use the `/verify-email` page
4. Log in with your verified account

## Deploying to AWS

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Email service credentials (Gmail, SendGrid, etc.)

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Session Security
SESSION_SECRET=your-secure-session-secret

# Email Service (for production)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Or use SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Installation
```bash
# Clone and install dependencies
npm install

# Set up database
npm run db:push

# Start the application
npm run dev
```

### Replacing Mock Email Service
To enable real email sending, update `server/auth.ts`:

1. Replace the mock console logging with actual email sending
2. Use the email service of your choice (Gmail, SendGrid, AWS SES, etc.)
3. Add proper email templates and error handling

Example email implementation locations:
- `server/auth.ts` - Registration endpoint
- Email templates can be added to `server/email/` directory
- Configure email service in `server/email-service.ts`

## Features
- ✅ Email/password authentication with verification
- ✅ AI-powered recipe generation (Anthropic Claude)
- ✅ Recipe collection management
- ✅ Interactive culinary chatbot
- ✅ Dark/light theme support
- ✅ Responsive design for all devices
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Session-based authentication with Passport.js

## Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Wouter
- **Backend**: Express.js, TypeScript, PostgreSQL
- **Authentication**: Passport.js with email verification
- **AI**: Anthropic Claude for recipe generation
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Ready for AWS/cloud deployment

## Development
```bash
# Start development server
npm run dev

# Database operations
npm run db:push
npm run db:studio

# Build for production
npm run build
```