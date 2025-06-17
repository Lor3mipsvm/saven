import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { useUserVaultShareBalance } from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { calculatePercentageOfBigInt, vaultABI } from '@shared/utilities'
import { useEffect } from 'react'
import { Address, isAddress, TransactionReceipt } from 'viem'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

// import { useGasAmountEstimate, useUserVaultShareBalance } from '..'

// : {
//   isWaiting: boolean
//   isConfirming: boolean
//   isSuccess: boolean
//   isError: boolean
//   txHash?: Address
//   txReceipt?: TransactionReceipt
//   sendRedeemTransaction?: () => void
// }

/**
 * Prepares and submits a `redeem` transaction to a vault
 * @param amount the amount of shares to redeem
 * @param vault the vault to redeem from
 * @param options optional args or callbacks
 * @returns
 */
export const useSendRedeemTransaction = (
  amount: bigint,
  vault: Vault
  // options?: {
  //   minAssets?: bigint
  //   onSend?: (txHash: `0x${string}`) => void
  //   onSuccess?: (txReceipt: TransactionReceipt) => void
  //   onError?: () => void
  // }
) => {
  const { address: userAddress, chain } = useAccount()

  const { data: vaultShareBalance, isFetched: isFetchedVaultShareBalance } =
    useUserVaultShareBalance(vault, userAddress as Address)

  const enabled =
    !!amount &&
    !!vault &&
    !!userAddress &&
    isAddress(userAddress) &&
    chain?.id === vault.chainId &&
    isFetchedVaultShareBalance &&
    !!vaultShareBalance &&
    amount <= vaultShareBalance.amount

  // const { data: gasEstimate } = useGasAmountEstimate(
  //   vault?.chainId,
  //   {
  //     address: vault?.address,
  //     abi: vaultABI,
  //     functionName: 'redeem',
  //     args: !!options?.minAssets
  //       ? [amount, userAddress as Address, userAddress as Address, options.minAssets]
  //       : [amount, userAddress as Address, userAddress as Address],
  //     account: userAddress as Address
  //   },
  //   { enabled }
  // )

  // const { data } = useSimulateContract({
  //   chainId: vault?.chainId,
  //   address: vault?.address,
  //   abi: vaultABI,
  //   functionName: 'redeem',
  //   args: !!options?.minAssets
  //     ? [amount, userAddress as Address, userAddress as Address, options.minAssets]
  //     : [amount, userAddress as Address, userAddress as Address],
  //   gas: !!gasEstimate ? calculatePercentageOfBigInt(gasEstimate, 1.2) : undefined,
  //   query: { enabled }
  // })

  const {
    data: txHash,
    isPending: isWaiting,
    isError: isSendingError,
    isSuccess: isSendingSuccess,
    writeContract: _sendRedeemTransaction
  } = useWriteContract()

  // const sendRedeemTransaction = !!_sendRedeemTransaction
  //   ? () => _sendRedeemTransaction(data.request)
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

  // useEffect(() => {
  //   if (isError) {
  //     options?.onError?.()
  //   }
  // }, [isError])

  // return { isWaiting, isConfirming, isSuccess, isError, txHash, txReceipt, sendRedeemTransaction }
  return null
}
