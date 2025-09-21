import { NETWORK } from '@shared/utilities'
import { createPublicClient, http, type PublicClient } from 'viem'
import { base } from 'viem/chains'

export const useBasePublicClient = (): PublicClient => {
  return createPublicClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)
  }) as PublicClient
}

/**
 * Returns Viem clients
 * @returns
 */
export const usePublicClients = (): any[] => {
  return [
    createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)
    })
  ]
}

/**
 * Returns Viem clients keyed by chain
 * @returns
 */
export const usePublicClientsByChain = (): Record<number, any> => {
  return {
    [NETWORK.base]: createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)
    })
  }
}
