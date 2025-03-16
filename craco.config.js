const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

// Updated configuration for modern packages
module.exports = {
  webpack: {
    plugins: [
      new ESLintWebpackPlugin({
        // ESLint configuration
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        emitWarning: true,
        // Don't fail the build on ESLint errors
        failOnError: false,
        // Only use ESLint to emit warnings, not to fail the build
        emitError: false,
      }),
    ],
    configure: (webpackConfig) => {
      // Remove ESLintWebpackPlugin if it exists
      if (webpackConfig.plugins) {
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => 
          plugin && plugin.constructor && plugin.constructor.name !== 'ESLintWebpackPlugin'
        );
      }
      
      // Update Terser plugin configuration
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
          
          // Set modern configurations
          terserPlugin.options.terserOptions = {
            ...terserPlugin.options.terserOptions,
            compress: {
              ...terserPlugin.options.terserOptions.compress,
              drop_console: false,
            },
            format: {
              comments: false,
            }
          };
        }
      }
      
      // Add necessary polyfills and fallbacks
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'),
        fs: false,
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify')
      };
      
      return webpackConfig;
    },
  },
  
  // Update Babel configuration to use transform plugins instead of proposal plugins
  babel: {
    loaderOptions: {
      plugins: [
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-private-property-in-object', { loose: true }]
      ],
    },
  },
  
  // Disable eslint during build to avoid issues
  eslint: {
    enable: false
  }
};
