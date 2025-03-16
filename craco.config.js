module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find terser plugin and update it
      const terserPluginIndex = webpackConfig.optimization.minimizer.findIndex(
        (plugin) => plugin.constructor.name === 'TerserPlugin'
      );
      
      if (terserPluginIndex > -1) {
        webpackConfig.optimization.minimizer[terserPluginIndex].options.terserOptions = {
          ...webpackConfig.optimization.minimizer[terserPluginIndex].options.terserOptions,
          compress: {
            ...webpackConfig.optimization.minimizer[terserPluginIndex].options.terserOptions.compress,
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
