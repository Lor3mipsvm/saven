/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/:path*',
                destination: '/:path*',
            },
        ]
    },
    webpack: (config, { isServer }) => {
        // Add polyfills for Node.js modules
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                '@react-native-async-storage/async-storage': require.resolve('./src/lib/async-storage-polyfill.js'),
            };
        }
        return config;
    },
}

module.exports = nextConfig
