import { base, baseSepolia } from 'wagmi/chains'

// Base Mainnet (Chain ID: 8453)
export const baseMainnet = {
    ...base,
    rpcUrls: {
        default: {
            http: ['https://mainnet.base.org'],
        },
        public: {
            http: ['https://mainnet.base.org'],
        },
    },
}

// Base Sepolia Testnet (Chain ID: 84532)
export const baseSepoliaTestnet = {
    ...baseSepolia,
    rpcUrls: {
        default: {
            http: ['https://sepolia.base.org'],
        },
        public: {
            http: ['https://sepolia.base.org'],
        },
    },
}

// Default chain configuration
export const defaultChain = baseMainnet

// Supported chains for the application
export const supportedChains = [baseMainnet, baseSepoliaTestnet]

// Chain configuration for different environments
export const getChainConfig = () => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID

    switch (chainId) {
        case '8453':
            return baseMainnet
        case '84532':
            return baseSepoliaTestnet
        default:
            return baseMainnet // Default to Base mainnet
    }
}
