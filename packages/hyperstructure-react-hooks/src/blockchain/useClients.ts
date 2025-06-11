// import { useIsTestnets } from '@shared/generic-react-hooks'
import { NETWORK } from '@shared/utilities'
import { createPublicClient, http } from 'viem'
import { worldchain } from 'viem/chains'

export const useWorldPublicClient = () => {
  return createPublicClient({
    chain: worldchain,
    transport: http()
  })
}

/**
 * Returns Viem clients
 * @returns
 */
export const usePublicClients = (): any[] => {
  return [
    createPublicClient({
      chain: worldchain,
      transport: http()
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
      transport: http()
    })
  }
}
