// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    // Reanimated plugin MUST be listed last
    plugins: ['react-native-reanimated/plugin'],
  };
};
