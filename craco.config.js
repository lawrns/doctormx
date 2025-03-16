const path = require('path');

// Simplified and robust configuration
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ESLintWebpackPlugin if it exists to avoid issues
      if (webpackConfig.plugins) {
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => 
          plugin.constructor && plugin.constructor.name !== 'ESLintWebpackPlugin'
        );
      }
      
      // Safety check for Terser plugin
      if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
        const terserPluginIndex = webpackConfig.optimization.minimizer.findIndex(
          (plugin) => plugin && plugin.constructor && plugin.constructor.name === 'TerserPlugin'
        );
        
        if (terserPluginIndex > -1) {
          const terserPlugin = webpackConfig.optimization.minimizer[terserPluginIndex];
          
          // Initialize options objects safely
          if (!terserPlugin.options) terserPlugin.options = {};
          if (!terserPlugin.options.terserOptions) terserPlugin.options.terserOptions = {};
          if (!terserPlugin.options.terserOptions.compress) terserPlugin.options.terserOptions.compress = {};
          
          // Now safely update the options
          terserPlugin.options.terserOptions = {
            ...terserPlugin.options.terserOptions,
            compress: {
              ...terserPlugin.options.terserOptions.compress,
              drop_console: false,
            },
          };
        }
      }
      
      // Handle possible React-dom alias issues
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = webpackConfig.resolve.alias || {};
      
      // Set fallbacks for potential problematic dependencies
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'),
        fs: false,
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify')
      };
      
      // Return the modified config
      return webpackConfig;
    },
  },
  babel: {
    loaderOptions: {
      // Ensure babel plugins are compatible
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
      ],
    },
  },
  // Disable eslint for build to avoid issues
  eslint: {
    enable: false
  }
};
