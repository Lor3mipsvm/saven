module.exports = {
  reactStrictMode: true,
  transpilePackages: [
    'file:../../shared/generic-react-hooks',
    'file:../../shared/react-components',
    'file:../../shared/types',
    'file:../../shared/ui',
    'file:../../shared/utilities'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, net: false, tls: false }
    }

    // Exclude Farcaster packages to prevent ESM issues
    config.externals = config.externals || []
    config.externals.push({
      '@farcaster/frame-sdk': 'commonjs @farcaster/frame-sdk',
      '@farcaster/miniapp-sdk': 'commonjs @farcaster/miniapp-sdk',
      '@farcaster/miniapp-wagmi-connector': 'commonjs @farcaster/miniapp-wagmi-connector',
      '@farcaster/frame-wagmi-connector': 'commonjs @farcaster/frame-wagmi-connector'
    })

    return config
  },
  i18n: {
    locales: ['en', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'pt', 'tr', 'zh', 'ru', 'uk'],
    defaultLocale: 'en'
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ]
  },
  experimental: {
    optimizePackageImports: ['flowbite-react', 'framer-motion', 'recharts', 'sonner']
  }
}
