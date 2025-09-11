import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

// Vault list configuration
export const VAULT_LIST_URL = process.env.NEXT_PUBLIC_VAULTLIST_URL || 'https://vaults.cabana.fi/vaults.json'

// Real Cabana vault list for Base mainnet
export const DEFAULT_VAULT_LIST = {
    name: 'Cabana Vaults',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tokens: [
        {
            chainId: 8453, // Base mainnet
            address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logoURI: 'https://tokens.1inch.io/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913.png'
        },
        {
            chainId: 8453,
            address: '0x4200000000000000000000000000000000000006', // WETH on Base
            symbol: 'WETH',
            name: 'Wrapped Ether',
            decimals: 18,
            logoURI: 'https://tokens.1inch.io/0x4200000000000000000000000000000000000006.png'
        }
    ],
    tags: {
        'prize-pool': {
            name: 'Prize Pool',
            description: 'Vaults that participate in prize pool mechanics'
        }
    },
    logoURI: 'https://cabana.fi/logo.png'
}

// Create public client for Base chain using our API route
export const publicClient = createPublicClient({
    chain: base,
    transport: http('/api/rpc')
})

// Vault list loading configuration
export const vaultListConfig = {
    url: VAULT_LIST_URL,
    fallback: DEFAULT_VAULT_LIST,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    retryCount: 3,
    retryDelay: 1000 // 1 second
}
