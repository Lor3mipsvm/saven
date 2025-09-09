'use client'

import { base } from 'viem/chains'

// Define chain objects manually to avoid import issues
export interface Chain {
    id: number
    name: string
    nativeCurrency: { name: string; symbol: string; decimals: number }
    rpcUrls: { default: { http: string[] } }
    blockExplorers: { default: { name: string; url: string } }
}

export interface Token {
    address: string
    symbol: string
    decimals: number
    chainId: number
    name: string
    logoURI?: string
    priceUSD: string
}

export interface Quote {
    fromChainId: number
    toChainId: number
    fromToken: Token
    toToken: Token
    fromAmount: string
    toAmount: string
    slippage: number
    gasCosts?: Array<{
        amount: string
        token: Token
    }>
}

export interface Route {
    fromChainId: number
    toChainId: number
    fromToken: Token
    toToken: Token
    fromAmount: string
    toAmount: string
    slippage: number
    steps: any[]
}

const baseChain: Chain = {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'] } },
    blockExplorers: { default: { name: 'Basescan', url: 'https://basescan.org' } }
}

const ethereum: Chain = {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.llamarpc.com'] } },
    blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } }
}
const polygon: Chain = {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
    rpcUrls: { default: { http: ['https://polygon.llamarpc.com'] } },
    blockExplorers: { default: { name: 'PolygonScan', url: 'https://polygonscan.com' } }
}
const arbitrum: Chain = {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://arbitrum.llamarpc.com'] } },
    blockExplorers: { default: { name: 'Arbiscan', url: 'https://arbiscan.io' } }
}
const optimism: Chain = {
    id: 10,
    name: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://optimism.llamarpc.com'] } },
    blockExplorers: { default: { name: 'Optimism Explorer', url: 'https://optimistic.etherscan.io' } }
}

// LI.FI API client (simplified implementation)
class LiFiClient {
    private apiUrl: string
    private integrator: string

    constructor(config: { integrator: string; apiUrl: string }) {
        this.integrator = config.integrator
        this.apiUrl = config.apiUrl
    }

    async getQuote(params: {
        fromChainId: number
        toChainId: number
        fromTokenAddress: string
        toTokenAddress: string
        fromAmount: string
        fromAddress: string
    }): Promise<Quote> {
        const response = await fetch(`${this.apiUrl}/quote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-lifi-integrator': this.integrator,
            },
            body: JSON.stringify({
                fromChainId: params.fromChainId,
                toChainId: params.toChainId,
                fromTokenAddress: params.fromTokenAddress,
                toTokenAddress: params.toTokenAddress,
                fromAmount: params.fromAmount,
                fromAddress: params.fromAddress,
                slippage: 0.005,
                maxPriceImpact: 0.05,
            }),
        })

        if (!response.ok) {
            throw new Error(`LI.FI API error: ${response.status}`)
        }

        return response.json()
    }

    async getTokens(params: { chainId: number }): Promise<{ tokens: Token[] }> {
        const response = await fetch(`${this.apiUrl}/tokens?chainId=${params.chainId}`, {
            headers: {
                'x-lifi-integrator': this.integrator,
            },
        })

        if (!response.ok) {
            throw new Error(`LI.FI API error: ${response.status}`)
        }

        return response.json()
    }

    // This method is no longer used - Dynamic handles balance fetching
    async getTokenBalance(params: {
        chainId: number
        tokenAddress: string
        userAddress: string
    }): Promise<{ balance: string }> {
        // Dynamic handles balance fetching via useTokenBalances hook
        return { balance: '0' }
    }
}

// LI.FI client instance
export const lifi = new LiFiClient({
    integrator: 'saven-app',
    apiUrl: 'https://li.quest/v1',
})

// Supported chains for cross-chain funding
export const SUPPORTED_CHAINS: Chain[] = [
    baseChain,      // Base (destination chain)
    ethereum,       // Ethereum
    polygon,        // Polygon
    arbitrum,       // Arbitrum
    optimism        // Optimism
]

// Chain ID to Chain mapping
export const CHAIN_MAP = new Map<number, Chain>(
    SUPPORTED_CHAINS.map(chain => [chain.id, chain])
)

// Common tokens for each chain (will be populated from LI.FI API)
export const COMMON_TOKENS: Record<number, Token[]> = {
    [base.id]: [
        {
            address: '0x4200000000000000000000000000000000000006',
            symbol: 'WETH',
            decimals: 18,
            chainId: base.id,
            name: 'Wrapped Ether',
            logoURI: 'https://tokens.1inch.io/0x4200000000000000000000000000000000000006.png',
            priceUSD: '0',
        },
        {
            address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            symbol: 'USDC',
            decimals: 6,
            chainId: base.id,
            name: 'USD Coin',
            logoURI: 'https://tokens.1inch.io/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913.png',
            priceUSD: '1',
        },
        {
            address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
            symbol: 'DAI',
            decimals: 18,
            chainId: base.id,
            name: 'Dai Stablecoin',
            logoURI: 'https://tokens.1inch.io/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb.png',
            priceUSD: '1',
        },
    ],
    [ethereum.id]: [
        {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            symbol: 'WETH',
            decimals: 18,
            chainId: ethereum.id,
            name: 'Wrapped Ether',
            logoURI: 'https://tokens.1inch.io/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2.png',
            priceUSD: '0',
        },
        {
            address: '0xA0b86a33E6441b8c4C8C0d1B4c8C0d1B4c8C0d1B',
            symbol: 'USDC',
            decimals: 6,
            chainId: ethereum.id,
            name: 'USD Coin',
            logoURI: 'https://tokens.1inch.io/0xA0b86a33E6441b8c4C8C0d1B4c8C0d1B4c8C0d1B.png',
            priceUSD: '1',
        },
    ],
    [polygon.id]: [
        {
            address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
            symbol: 'WMATIC',
            decimals: 18,
            chainId: polygon.id,
            name: 'Wrapped Matic',
            logoURI: 'https://tokens.1inch.io/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270.png',
            priceUSD: '0',
        },
        {
            address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            symbol: 'USDC',
            decimals: 6,
            chainId: polygon.id,
            name: 'USD Coin',
            logoURI: 'https://tokens.1inch.io/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174.png',
            priceUSD: '1',
        },
    ],
    [arbitrum.id]: [
        {
            address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            symbol: 'WETH',
            decimals: 18,
            chainId: arbitrum.id,
            name: 'Wrapped Ether',
            logoURI: 'https://tokens.1inch.io/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1.png',
            priceUSD: '0',
        },
        {
            address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            symbol: 'USDC',
            decimals: 6,
            chainId: arbitrum.id,
            name: 'USD Coin',
            logoURI: 'https://tokens.1inch.io/0xaf88d065e77c8cC2239327C5EDb3A432268e5831.png',
            priceUSD: '1',
        },
    ],
    [optimism.id]: [
        {
            address: '0x4200000000000000000000000000000000000006',
            symbol: 'WETH',
            decimals: 18,
            chainId: optimism.id,
            name: 'Wrapped Ether',
            logoURI: 'https://tokens.1inch.io/0x4200000000000000000000000000000000000006.png',
            priceUSD: '0',
        },
        {
            address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
            symbol: 'USDC',
            decimals: 6,
            chainId: optimism.id,
            name: 'USD Coin',
            logoURI: 'https://tokens.1inch.io/0x7F5c764cBc14f9669B88837ca1490cCa17c31607.png',
            priceUSD: '1',
        },
    ],
}

// Cache for quotes to prevent excessive API calls
const quoteCache = new Map<string, { quote: Quote; timestamp: number }>()
const QUOTE_CACHE_DURATION = 30 * 1000 // 30 seconds

// Get quote for token swap
export async function getSwapQuote(
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    fromAddress: string
): Promise<Quote> {
    const cacheKey = `${fromChainId}-${toChainId}-${fromTokenAddress}-${toTokenAddress}-${amount}-${fromAddress}`

    // Check cache first
    const cached = quoteCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_DURATION) {
        return cached.quote
    }

    try {
        const quote = await lifi.getQuote({
            fromChainId,
            toChainId,
            fromTokenAddress,
            toTokenAddress,
            fromAmount: amount,
            fromAddress,
        })

        // Cache the quote
        quoteCache.set(cacheKey, { quote, timestamp: Date.now() })

        return quote
    } catch (error) {
        console.error('Failed to get swap quote:', error)
        throw new Error('Failed to get swap quote. Please try again.')
    }
}

// Execute swap transaction (simplified - would need wallet integration)
export async function executeSwap(
    quote: Quote,
    signer: any
): Promise<string> {
    try {
        // This is a simplified implementation
        // In a real implementation, you would use the wallet to sign and send the transaction
        console.log('Executing swap quote:', quote)

        // For now, return a mock transaction hash
        // TODO: Implement actual transaction execution with wallet integration
        return '0x' + Math.random().toString(16).substr(2, 8)
    } catch (error) {
        console.error('Failed to execute swap:', error)
        throw new Error('Failed to execute swap. Please try again.')
    }
}

// Get supported tokens for a chain
export async function getSupportedTokens(chainId: number): Promise<Token[]> {
    try {
        const result = await lifi.getTokens({ chainId })

        // Ensure we always return an array
        const tokens = Array.isArray(result.tokens) ? result.tokens : []

        // If no tokens from API, return common tokens as fallback
        if (tokens.length === 0) {
            return Array.isArray(COMMON_TOKENS[chainId]) ? COMMON_TOKENS[chainId] : []
        }

        return tokens
    } catch (error) {
        console.error('Failed to get supported tokens:', error)
        // Return common tokens as fallback
        return Array.isArray(COMMON_TOKENS[chainId]) ? COMMON_TOKENS[chainId] : []
    }
}

// Get user token balance
export async function getTokenBalance(
    chainId: number,
    tokenAddress: string,
    userAddress: string
): Promise<string> {
    try {
        const result = await lifi.getTokenBalance({
            chainId,
            tokenAddress,
            userAddress,
        })
        return result.balance
    } catch (error) {
        console.error('Failed to get token balance:', error)
        return '0'
    }
}

// Utility function to format token amount
export function formatTokenAmount(amount: string, decimals: number): string {
    const num = BigInt(amount)
    const divisor = BigInt(10 ** decimals)
    const whole = num / divisor
    const remainder = num % divisor

    if (remainder === BigInt(0)) {
        return whole.toString()
    }

    const remainderStr = remainder.toString().padStart(decimals, '0')
    const trimmed = remainderStr.replace(/0+$/, '')

    if (trimmed === '') {
        return whole.toString()
    }

    return `${whole}.${trimmed}`
}

// Utility function to parse token amount
export function parseTokenAmount(amount: string, decimals: number): string {
    const [whole, decimal = ''] = amount.split('.')
    const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals)
    return `${whole}${paddedDecimal}`
}
