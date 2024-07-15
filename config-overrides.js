const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "url": require.resolve("url/"),
    "buffer": require.resolve("buffer/"),
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify")
  };
  config.plugins.push(new NodePolyfillPlugin());
  return config;
};
