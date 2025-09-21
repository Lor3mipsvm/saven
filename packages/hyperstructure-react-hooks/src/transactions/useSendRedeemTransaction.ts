import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { vaultABI } from '@shared/utilities'
import { useEffect } from 'react'
import { Address, TransactionReceipt } from 'viem'
import { useAccount } from 'wagmi'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useUserVaultShareBalance } from '..'

/**
 * Prepares and submits a redeem transaction from a vault (non-EIP-5792)
 * @param amount the amount of shares to redeem
 * @param vault the vault to redeem from
 * @param options optional settings and callbacks
 * @returns
 */
export const useSendRedeemTransaction = (
  amount: bigint,
  vault: Vault,
  options?: {
    minAssets?: bigint
    paymasterService?: { url: string; optional: boolean }
    onSend?: (txHash: `0x${string}`) => void
    onSuccess?: (txReceipt: TransactionReceipt) => void
    onError?: () => void
    enabled?: boolean
  }
) => {
  const { address: userAddress, chain } = useAccount()

  const { data: vaultShareBalance, isFetched: isFetchedVaultShareBalance } =
    useUserVaultShareBalance(vault, userAddress!)

  const enabled =
    !!amount &&
    !!vault &&
    !!userAddress &&
    chain?.id === vault.chainId &&
    isFetchedVaultShareBalance &&
    !!vaultShareBalance &&
    amount <= vaultShareBalance.amount &&
    options?.enabled !== false

  // Simulate the redeem transaction
  const { data, error } = useSimulateContract({
    address: vault.address,
    abi: vaultABI,
    functionName: 'redeem',
    args: !!options?.minAssets && !!userAddress
      ? [amount, userAddress, userAddress, options.minAssets]
      : !!userAddress
      ? [amount, userAddress, userAddress]
      : undefined,
    query: { enabled }
  })

  const {
    data: txHash,
    isPending: isWaiting,
    isError: isSendingError,
    isSuccess: isSendingSuccess,
    writeContract: _sendRedeemTransaction
  } = useWriteContract()

  const sendRedeemTransaction = !!data
    ? () => _sendRedeemTransaction(data.request)
    : undefined

  useEffect(() => {
    if (!!txHash && isSendingSuccess) {
      options?.onSend?.(txHash)
    }
  }, [isSendingSuccess, txHash])

  const {
    data: txReceipt,
    isFetching: isConfirming,
    isSuccess,
    isError: isConfirmingError
  } = useWaitForTransactionReceipt({ chainId: vault?.chainId, hash: txHash })

  useEffect(() => {
    if (!!txReceipt && isSuccess) {
      options?.onSuccess?.(txReceipt)
    }
  }, [isSuccess, txReceipt])

  const isError = isSendingError || isConfirmingError || !!error

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
    sendRedeemTransaction
  }
}
