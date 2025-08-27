const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript paths
config.resolver.alias = {
  '@': './src',
  '@mealplanner/shared': '../mealplanner-shared/src',
};

module.exports = config;