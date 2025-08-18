import { TWAB_REWARDS_ADDRESSES, twabRewardsABI } from '@shared/utilities'
import { useEffect } from 'react'
import { Address, isAddress, TransactionReceipt } from 'viem'
import { useAccount } from 'wagmi'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

/**
 * Prepares and submits a `destroyPromotion` transaction to a TWAB rewards contract
 * @param chainId the network the promotion to destroy is in
 * @param promotionId the ID of the promotion to destroy
 * @param recipient the address to receive any unclaimed tokens
 * @param options optional settings or callbacks
 * @returns
 */
export const useSendDestroyPromotionTransaction = (
  chainId: number,
  promotionId: number,
  recipient: Address,
  options?: {
    twabRewardsAddress?: Address
    onSend?: (txHash: `0x${string}`) => void
    onSuccess?: (txReceipt: TransactionReceipt) => void
    onError?: () => void
  }
): {
  isWaiting: boolean
  isConfirming: boolean
  isSuccess: boolean
  isError: boolean
  txHash?: Address
  txReceipt?: TransactionReceipt
  sendDestroyPromotionTransaction?: () => void
} => {
  const { chain } = useAccount()

  const twabRewardsAddress = !!chainId
    ? options?.twabRewardsAddress ?? TWAB_REWARDS_ADDRESSES[chainId]
    : undefined

  const enabled =
    !!chainId &&
    chain?.id === chainId &&
    !!promotionId &&
    !!recipient &&
    isAddress(recipient) &&
    !!twabRewardsAddress

  const { data } = useSimulateContract({
    chainId,
    address: twabRewardsAddress,
    abi: twabRewardsABI,
    functionName: 'destroyPromotion',
    args: [BigInt(promotionId), recipient],
    query: { enabled }
  })

  const {
    data: txHash,
    isPending: isWaiting,
    isError: isSendingError,
    isSuccess: isSendingSuccess,
    writeContract: _sendDestroyPromotionTransaction
  } = useWriteContract()

  const sendDestroyPromotionTransaction =
    !!data && !!_sendDestroyPromotionTransaction
      ? () => _sendDestroyPromotionTransaction(data.request)
      : undefined

  useEffect(() => {
    if (!!txHash && isSendingSuccess) {
      options?.onSend?.(txHash)
    }
  }, [isSendingSuccess])

  const {
    data: txReceipt,
    isFetching: isConfirming,
    isSuccess,
    isError: isConfirmingError
  } = useWaitForTransactionReceipt({ chainId, hash: txHash })

  useEffect(() => {
    if (!!txReceipt && isSuccess) {
      options?.onSuccess?.(txReceipt)
    }
  }, [isSuccess])

  const isError = isSendingError || isConfirmingError

  useEffect(() => {
    if (isError) {
      options?.onError?.()
    }
  }, [isError])

  return {
    isWaiting,
    isConfirming,
    isSuccess,
    isError,
    txHash,
    txReceipt,
    sendDestroyPromotionTransaction
  }
}
