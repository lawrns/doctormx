module.exports = {
  webpack: {
    configure: (webpackConfig) => {
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
