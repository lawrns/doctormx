const path = require('path');

// We need to handle ESLint plugin specially
let eslintWebpackPlugin;
try {
  // Try to import directly
  eslintWebpackPlugin = require('eslint-webpack-plugin');
} catch (e) {
  console.warn('eslint-webpack-plugin not found, will skip ESLint during build');
}

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ESLintWebpackPlugin if it exists
      if (webpackConfig.plugins) {
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => 
          plugin.constructor && plugin.constructor.name !== 'ESLintWebpackPlugin'
        );
      }
      
      // Find terser plugin and update it
      const terserPluginIndex = webpackConfig.optimization.minimizer.findIndex(
        (plugin) => plugin.constructor.name === 'TerserPlugin'
      );
      
      if (terserPluginIndex > -1) {
        const terserPlugin = webpackConfig.optimization.minimizer[terserPluginIndex];
        
        // Initialize options objects if they don't exist
        if (!terserPlugin.options) terserPlugin.options = {};
        if (!terserPlugin.options.terserOptions) terserPlugin.options.terserOptions = {};
        if (!terserPlugin.options.terserOptions.compress) terserPlugin.options.terserOptions.compress = {};
        
        // Now safely update the options
        terserPlugin.options.terserOptions = {
          ...terserPlugin.options.terserOptions,
          compress: {
            ...terserPlugin.options.terserOptions.compress,
            // Disable console output removal to avoid warnings
            drop_console: false,
          },
        };
      }
      
      // Return the modified config
      return webpackConfig;
    },
  },
  babel: {
    loaderOptions: {
      // Disable certain babel plugins that might cause warnings
      // This is a more targeted approach than changing the whole preset
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
      ],
    },
  },
  // Disable eslint for build to avoid deprecation warnings
  eslint: {
    enable: false
  }
};
