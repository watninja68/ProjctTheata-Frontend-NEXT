/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle audio worklet files
    config.module.rules.push({
      test: /audio-processor\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/js/[name][ext]'
      }
    });

    // Handle eventemitter3 module resolution
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  // Ensure static files are served correctly
  async rewrites() {
    return [
      {
        source: '/audio-processor.js',
        destination: '/audio-processor.js'
      }
    ];
  }
};

export default nextConfig;
