import { useEffect } from 'react'
import { Address, Hash, isAddress, WalletCallReceipt } from 'viem'
import { useAccount, useCapabilities } from 'wagmi'
import { useSendCalls, useWaitForCallsStatus } from 'wagmi'

/**
 * Prepares and submits [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) calls
 * @dev should check if wallet supports this standard before calling this (`useCapabilities` wagmi hook)
 * @param chainId the network to make calls on
 * @param calls the calls to make
 * @param options optional settings and callbacks
 * @returns
 */
export const useSend5792Calls = (
  chainId: number,
  calls: { to: Address; data: Hash }[],
  options?: {
    paymasterService?: { url: string; optional?: boolean }
    onSend?: () => void
    onSuccess?: (callReceipts: WalletCallReceipt<bigint, 'success' | 'reverted'>[]) => void
    onError?: () => void
    enabled?: boolean
  }
): {
  isWaiting: boolean
  isConfirming: boolean
  isSuccess: boolean
  isError: boolean
  txHashes?: Hash[]
  callReceipts?: WalletCallReceipt<bigint, 'success' | 'reverted'>[]
  sendCalls?: () => void
} => {
  const { address: userAddress, chain } = useAccount()

  const { data: capabilities } = useCapabilities()

  const enabled =
    !!userAddress &&
    isAddress(userAddress) &&
    chain?.id === chainId &&
    !!calls?.length &&
    !!capabilities?.wallet_sendCalls &&
    options?.enabled !== false

  const {
    data: callsData,
    isPending: isWaiting,
    isError: isSendingError,
    isSuccess: isSendingSuccess,
    sendCalls: _sendCalls,
    error: sendCallsError
  } = useSendCalls()

  console.log('🔧 useSendCalls hook state:', {
    callsData,
    isWaiting,
    isSendingError,
    isSendingSuccess,
    hasSendCalls: !!_sendCalls,
    sendCallsError: sendCallsError?.message,
    capabilities: capabilities?.wallet_sendCalls,
    enabled,
    userAddress,
    chainId,
    callsLength: calls.length
  })

  const sendCalls =
    enabled && !!_sendCalls
      ? () => {
        console.log('🚀 EIP-5792 sendCalls called with:', {
          chainId,
          account: userAddress,
          callsCount: calls.length,
          calls: calls.map(call => ({
            to: call.to,
            dataLength: call.data.length,
            value: call.value?.toString() || '0'
          }))
        })
        return _sendCalls({
          chainId,
          account: userAddress,
          calls,
          capabilities: !!options?.paymasterService
            ? {
              paymasterService: {
                [chainId]: options.paymasterService,
                url: options.paymasterService.url
              }
            }
            : undefined
        })
      }
      : undefined

  console.log('🔧 sendCalls function created:', {
    hasSendCalls: !!sendCalls,
    enabled,
    hasSendCallsFunction: !!_sendCalls,
    hasCapabilities: !!capabilities?.wallet_sendCalls,
    reason: !enabled ? 'not enabled' : !_sendCalls ? 'no _sendCalls function' : !capabilities?.wallet_sendCalls ? 'wallet does not support EIP-5792' : 'created successfully'
  })

  useEffect(() => {
    if (!!callsData?.id && isSendingSuccess) {
      options?.onSend?.()
    }
  }, [isSendingSuccess])

  const {
    data: callsStatus,
    isFetching: isConfirming,
    isSuccess,
    isError: isConfirmingError
  } = useWaitForCallsStatus({ id: callsData?.id })

  useEffect(() => {
    if (!!callsStatus && !!callsStatus.receipts?.length && isSuccess) {
      options?.onSuccess?.(callsStatus.receipts)
    }
  }, [isSuccess])

  const isError = isSendingError || isConfirmingError

  useEffect(() => {
    if (isError) {
      console.error('🚨 EIP-5792 transaction error:', {
        isSendingError,
        isConfirmingError,
        sendCallsError: sendCallsError?.message,
        callsData,
        callsStatus,
        enabled,
        userAddress,
        chainId,
        callsLength: calls.length
      })
      options?.onError?.()
    }
  }, [isError])

  return {
    isWaiting,
    isConfirming,
    isSuccess,
    isError,
    txHashes: callsStatus?.receipts?.map((r) => r.transactionHash),
    callReceipts: callsStatus?.receipts,
    sendCalls
  }
}
