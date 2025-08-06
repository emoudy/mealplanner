export default {
  expo: {
    name: "FlavorBot",
    slug: "flavorbot-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.flavorbot.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.flavorbot.mobile"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "expo-secure-store"
    ],
    scheme: "flavorbot",
    newArchEnabled: true,
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001"
    }
  }
};