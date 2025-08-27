# MealPlanner Mobile

React Native mobile application for MealPlanner - AI-powered recipe management platform.

## Features

- **Cross-Platform**: iOS and Android support with Expo
- **Native Performance**: React Native with optimized performance
- **Authentication**: Secure email/password authentication
- **Recipe Management**: Full CRUD operations with AI assistance
- **AI Chat**: Interactive culinary assistant
- **Offline Support**: Cached data with background sync
- **Native UI**: Platform-specific design patterns

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Studio
- MealPlanner Backend running

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## Architecture

### Tech Stack
- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **State Management**: TanStack Query + React Context
- **Storage**: Expo Secure Store
- **Icons**: Expo Vector Icons
- **Notifications**: Expo Notifications (future)

### Project Structure
```
app/                 # Expo Router screens
├── (tabs)/         # Tab navigation
├── auth.tsx        # Authentication screen
└── _layout.tsx     # Root layout

src/
├── components/     # Reusable components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
└── utils/          # Utility functions
```

### Shared Code
- Uses `@mealplanner/shared` for 70-80% code reuse
- Shared API client, schemas, and business logic
- Platform-specific UI implementations

## Features

### Authentication
- Email/password login/registration
- Secure token storage
- Auto-login on app launch

### Recipe Management
- Browse user recipes
- View recipe details
- Create/edit recipes (future)
- AI-generated recipes

### AI Assistant
- Interactive chat interface
- Recipe recommendations
- Cooking assistance

### Profile Management
- User settings
- Usage statistics
- Account management

## Deployment

### iOS App Store
1. Build with EAS Build
2. Submit via App Store Connect
3. Follow Apple review guidelines

### Google Play Store
1. Build signed APK/AAB
2. Upload to Google Play Console
3. Follow Play Store policies

## Platform Support

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0)
- **Web**: Modern browsers (development)

## Development Tools

- **Expo Dev Tools**: Development server
- **Metro Bundler**: JavaScript bundling
- **Flipper**: Debugging (optional)
- **Reactotron**: State inspection (optional)