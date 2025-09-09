import { createPublicClient, http, PublicClient } from 'viem'
import { base } from 'viem/chains'

export const publicClients: Record<number, any> = {
    [base.id]: createPublicClient({
        chain: base,
        transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || '/api/rpc')
    })
}

console.log('🔧 Public clients configured:', {
    baseId: base.id,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || '/api/rpc',
    clients: publicClients
})
