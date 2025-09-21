import { createPublicClient, http, PublicClient } from 'viem'
import { base } from 'viem/chains'

export const publicClients: Record<number, any> = {
    [base.id]: createPublicClient({
        chain: base,
        transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org')
    })
}

