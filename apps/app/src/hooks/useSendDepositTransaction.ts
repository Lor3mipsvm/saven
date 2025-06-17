import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useVaultTokenAddress,
  useWorldPublicClient
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { useEffect } from 'react'
import { decodeDepositEvent, deposit } from 'src/minikit_txs'
import { Address, isAddress, TransactionReceipt } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useWriteContract } from '@hooks/useWriteContract'

/**
 * Prepares and submits a `deposit` transaction to a vault
 * @param amount the amount to deposit
 * @param vault the vault to deposit into
 * @param options optional callbacks
 * @returns
 */
export const useSendDepositTransaction = (
  amount: bigint,
  vault: Vault,
  options?: {
    // onSuccess?: (txReceipt: TransactionReceipt) => void
    // onError?: () => void
    onSend?: () => void
    onSuccess?: (depositEvent: ReturnType<typeof decodeDepositEvent>) => void
    onSettled?: () => void
    onError?: () => void
  }
): {
  // isWaiting: boolean
  // isConfirming: boolean
  // isSuccess: boolean
  // isError: boolean
  // txHash?: Address
  // txReceipt?: TransactionReceipt
  // shares?: string
  sendDepositTransaction?: () => void
} => {
  // const { address: userAddress, chain } = useAccount()

  const { data: tokenAddress, isFetched: isFetchedTokenAddress } = useVaultTokenAddress(vault)

  // const enabled =
  //   !!amount &&
  //   !!vault &&
  //   isFetchedTokenAddress &&
  //   !!tokenAddress &&
  //   !!userAddress &&
  //   isAddress(userAddress) &&
  //   chain?.id === vault.chainId

  const publicClient = useWorldPublicClient()
  const sendDepositTransaction = () =>
    deposit(amount, publicClient, vault.address, tokenAddress, options)

  // const {
  //   data: txHash,
  //   isPending: isWaiting,
  //   isError: isSendingError,
  //   isSuccess: isSendingSuccess,
  //   writeContract: _sendDepositTransaction
  // } = useWriteContract()

  // const sendDepositTransaction = !!_sendDepositTransaction
  //   ? () => _sendDepositTransaction(data.request)
  //   : undefined

  // useEffect(() => {
  //   if (!!txHash && isSendingSuccess) {
  //     options?.onSend?.(txHash)
  //   }
  // }, [isSendingSuccess])

  // const {
  //   data: txReceipt,
  //   isFetching: isConfirming,
  //   isSuccess,
  //   isError: isConfirmingError
  // } = useWaitForTransactionReceipt({ chainId: vault?.chainId, hash: txHash })

  // useEffect(() => {
  //   if (!!txReceipt && isSuccess) {
  //     options?.onSuccess?.(txReceipt)
  //   }
  // }, [isSuccess])

  // const isError = isSendingError || isConfirmingError
  // const isError = isConfirmingError

  // useEffect(() => {
  //   if (isError) {
  //     options?.onError?.()
  //   }
  // }, [isError])

  // return { isWaiting, isConfirming, isSuccess, isError, txHash, txReceipt, sendDepositTransaction }
  // return { isConfirming, isSuccess, isError, txHash, txReceipt, sendDepositTransaction }
  return { sendDepositTransaction }
}
