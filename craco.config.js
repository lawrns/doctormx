const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

module.exports = {
  webpack: {
    plugins: [
      new ESLintWebpackPlugin({
        // Modern ESLint configuration
        extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
        emitError: false,
        emitWarning: true,
        failOnError: false,
        formatter: 'stylish',
        lintDirtyModulesOnly: true,
        threads: true
      }),
    ],
    configure: (webpackConfig) => {
      // Add polyfills and fallbacks for browser compatibility
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'),
        fs: false,
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify')
      };
      
      // Safely configure Terser plugin if it exists
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
      
      return webpackConfig;
    },
  },
  
  // Update Babel configuration to use transform plugins
  babel: {
    loaderOptions: {
      plugins: [
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        '@babel/plugin-transform-nullish-coalescing-operator',
        '@babel/plugin-transform-optional-chaining',
        '@babel/plugin-transform-numeric-separator'
      ],
    },
  },
  
  // Disable eslint during build to avoid issues
  eslint: {
    enable: false
  }
};
