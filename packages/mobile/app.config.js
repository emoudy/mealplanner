module.exports = {
  expo: {
    name: 'MealPlanner',
    slug: 'mealplanner',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mealplanner.app',
      buildNumber: '1'
    },
    android: {
      package: 'com.mealplanner.app',
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: '#FFFFFF'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-camera',
      [
        'expo-notifications',
        {
          color: '#ffffff'
        }
      ]
    ],
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:5000'
    }
  }
};