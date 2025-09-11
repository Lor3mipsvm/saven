import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'

// Use our API route to proxy RPC calls and avoid CORS issues
const getRpcUrl = () => {
    // Use our API route instead of direct Alchemy calls
    return '/api/rpc'
}

// Fallback RPC URL for Base mainnet
const fallbackRpcUrl = 'https://mainnet.base.org'

export const wagmiConfig = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(getRpcUrl()),
    },
})