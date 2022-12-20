const withPWA = require('next-pwa')({
  dest: 'public',
});

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  compress: false,
  poweredByHeader: false,
  eslint: {
    dirs: [
      'pages',
      'layouts',
      'components',
      'lib',
      'hooks',
      'plugins',
      'store',
      'constants',
    ],
  },
  webpack: (config) => {
    return config;
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      aggregateTimeout: 100,
      poll: 300,
      ignored: ['node_modules'],
    };

    return config;
  },
};

module.exports =
  process.env.NODE_ENV == 'production' ? withPWA(config) : config;
