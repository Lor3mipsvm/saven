import { NETWORK } from '@shared/utilities'
import { createPublicClient, http, type PublicClient } from 'viem'
import { worldchain } from 'viem/chains'

export const useWorldPublicClient = (): PublicClient => {
  console.log(
    createPublicClient({
      chain: worldchain,
      transport: http(process.env.NEXT_PUBLIC_WORLD_RPC_URL)
    })
  )
  return createPublicClient({
    chain: worldchain,
    transport: http(process.env.NEXT_PUBLIC_WORLD_RPC_URL)
  }) as PublicClient
}

/**
 * Returns Viem clients
 * @returns
 */
export const usePublicClients = (): any[] => {
  return [
    createPublicClient({
      chain: worldchain,
      transport: http(process.env.NEXT_PUBLIC_WORLD_RPC_URL)
    })
  ]
}

/**
 * Returns Viem clients keyed by chain
 * @returns
 */
export const usePublicClientsByChain = (): Record<number, any> => {
  return {
    [NETWORK.world]: createPublicClient({
      chain: worldchain,
      transport: http(process.env.NEXT_PUBLIC_WORLD_RPC_URL)
    })
  }
}
