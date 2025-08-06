const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript paths
config.resolver.alias = {
  '@': './src',
  '@flavorbot/shared': '../flavorbot-shared/src',
};

module.exports = config;