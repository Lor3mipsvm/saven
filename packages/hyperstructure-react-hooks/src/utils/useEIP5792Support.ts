import { useCapabilities } from 'wagmi'

/**
 * Hook to detect if the connected wallet supports EIP-5792
 * @returns boolean indicating EIP-5792 support
 */
export const useEIP5792Support = () => {
  const { data: capabilities } = useCapabilities()
  
  // Check if wallet supports wallet_sendCalls (EIP-5792)
  const supportsEIP5792 = !!capabilities?.wallet_sendCalls
  
  return {
    supportsEIP5792,
    capabilities
  }
}
