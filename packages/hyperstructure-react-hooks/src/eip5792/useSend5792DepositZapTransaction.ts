import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { DOLPHIN_ADDRESS, erc20ABI, lower, NETWORK, ZAP_SETTINGS, zapRouterABI } from '@shared/utilities'
import { useMemo } from 'react'
import { Address, encodeFunctionData, Hash, isAddress, WalletCallReceipt } from 'viem'
import { useAccount, useCapabilities } from 'wagmi'
import { useTokenAllowance, useVaultTokenData, useZapArgs } from '..'
import { useSend5792Calls } from './useSend5792Calls'
import { useSendDepositZapTransaction } from '../zaps/useSendDepositZapTransaction'

/**
 * Prepares and submits [EIP-5792](https://eips.ethereum.org/EIPS/eip-5792) calls to swap and deposit into a vault
 * @dev should check if wallet supports this standard before calling this (`useCapabilities` wagmi hook)
 * @param inputToken the token the user is providing
 * @param vault the vault to deposit into
 * @param options optional callbacks
 * @returns
 */
export const useSend5792DepositZapTransaction = (
  inputToken: { address: Address; decimals: number; amount: bigint },
  vault: Vault,
  options?: Parameters<typeof useSend5792Calls>['2']
) => {
  const { address: userAddress, chain } = useAccount()
  const { data: capabilities } = useCapabilities()

  const { zapRouter, zapTokenManager } = ZAP_SETTINGS[vault?.chainId] ?? {}

  const { data: allowance, isFetched: isFetchedAllowance } = useTokenAllowance(
    vault?.chainId,
    userAddress!,
    zapTokenManager,
    inputToken?.address
  )

  const { data: vaultTokenData } = useVaultTokenData(vault!)

  const {
    zapArgs,
    amountOut,
    isFetched: isFetchedZapArgs,
    isFetching: isFetchingZapArgs
  } = useZapArgs(
    vault.chainId as NETWORK,
    inputToken,
    {
      address: vaultTokenData?.address || vault.address,
      decimals: vaultTokenData?.decimals || vault.decimals!
    },
    vault.address // Pass vault address for deposit zaps
  )

  const supportsEIP5792 = !!capabilities?.wallet_sendCalls

  const enabled =
    !!inputToken?.address &&
    inputToken.decimals !== undefined &&
    !!inputToken.amount &&
    !!vault &&
    !!userAddress &&
    isAddress(userAddress) &&
    chain?.id === vault.chainId &&
    !!zapRouter &&
    !!zapTokenManager &&
    isFetchedAllowance &&
    allowance !== undefined &&
    !!zapArgs &&
    options?.enabled !== false

  console.log('🔧 EIP-5792 enabled check:', {
    hasInputTokenAddress: !!inputToken?.address,
    hasInputTokenDecimals: inputToken.decimals !== undefined,
    hasInputTokenAmount: !!inputToken.amount,
    hasVault: !!vault,
    hasUserAddress: !!userAddress,
    isAddressValid: isAddress(userAddress),
    chainMatches: chain?.id === vault.chainId,
    hasZapRouter: !!zapRouter,
    hasZapTokenManager: !!zapTokenManager,
    isFetchedAllowance,
    hasAllowance: allowance !== undefined,
    hasZapArgs: !!zapArgs,
    supportsEIP5792,
    optionsEnabled: options?.enabled !== false,
    enabled
  })

  const calls = useMemo(() => {
    const txs: { to: Address; data: Hash; value?: bigint }[] = []

    console.log('🔧 EIP-5792 calls generation:', {
      enabled,
      inputTokenAddress: inputToken.address,
      inputTokenAmount: inputToken.amount.toString(),
      allowance: allowance?.toString(),
      zapTokenManager,
      zapRouter,
      zapArgs: zapArgs ? 'present' : 'missing',
      callsLength: txs.length,
      hasCalls: txs.length > 0
    })

    if (enabled) {
      if (lower(inputToken.address) !== DOLPHIN_ADDRESS && allowance < inputToken.amount) {
        console.log('🔧 Adding approval transaction')
        txs.push({
          to: inputToken.address,
          data: encodeFunctionData({
            abi: erc20ABI,
            functionName: 'approve',
            args: [zapTokenManager, inputToken.amount]
          })
        })
      }

      console.log('🔧 Adding executeOrder transaction')
      txs.push({
        to: zapRouter,
        data: encodeFunctionData({
          abi: [zapRouterABI['15']],
          functionName: 'executeOrder',
          args: zapArgs
        }),
        value: lower(inputToken.address) === DOLPHIN_ADDRESS ? inputToken.amount : 0n
      })
    }

    console.log('🔧 Generated calls:', txs.length, 'transactions')

    if (txs.length > 0) {
      console.log('🔧 Call details:', txs.map((tx, index) => ({
        index,
        to: tx.to,
        dataLength: tx.data.length,
        value: tx.value?.toString() || '0'
      })))
    }

    return txs
  }, [inputToken, vault, allowance, enabled])

  // Use EIP-5792 if supported, otherwise fall back to regular contract simulation
  const eip5792Result = useSend5792Calls(
    chain?.id!,
    calls,
    { ...options, enabled: enabled && supportsEIP5792 }
  )

  const fallbackResult = useSendDepositZapTransaction(
    inputToken,
    vault,
    {
      onSend: options?.onSend,
      onSuccess: (txReceipt) => {
        // Convert TransactionReceipt to WalletCallReceipt format for consistency
        const walletCallReceipt: WalletCallReceipt<bigint, 'success' | 'reverted'> = {
          status: 'success',
          blockHash: txReceipt.blockHash,
          blockNumber: txReceipt.blockNumber,
          gasUsed: txReceipt.gasUsed,
          logs: txReceipt.logs,
          transactionHash: txReceipt.transactionHash,
          transactionIndex: txReceipt.transactionIndex
        }
        options?.onSuccess?.([walletCallReceipt])
      },
      onError: options?.onError
    }
  )

  console.log('🔧 Wallet capability check:', {
    supportsEIP5792,
    usingEIP5792: supportsEIP5792 && enabled,
    usingFallback: !supportsEIP5792 && enabled
  })

  if (supportsEIP5792 && enabled) {
    return {
      ...eip5792Result,
      send5792DepositZapTransaction: eip5792Result.sendCalls,
      amountOut,
      isFetchedZapArgs,
      isFetchingZapArgs
    }
  } else {
    return {
      isWaiting: fallbackResult.isWaiting,
      isConfirming: fallbackResult.isConfirming,
      isSuccess: fallbackResult.isSuccess,
      isError: fallbackResult.isError,
      txHashes: fallbackResult.txHash ? [fallbackResult.txHash] : undefined,
      callReceipts: fallbackResult.txReceipt ? [{
        status: 'success' as const,
        blockHash: fallbackResult.txReceipt.blockHash,
        blockNumber: fallbackResult.txReceipt.blockNumber,
        gasUsed: fallbackResult.txReceipt.gasUsed,
        logs: fallbackResult.txReceipt.logs,
        transactionHash: fallbackResult.txReceipt.transactionHash,
        transactionIndex: fallbackResult.txReceipt.transactionIndex
      }] : undefined,
      send5792DepositZapTransaction: fallbackResult.sendDepositZapTransaction,
      amountOut: fallbackResult.amountOut,
      isFetchedZapArgs: fallbackResult.isFetchedZapArgs,
      isFetchingZapArgs: fallbackResult.isFetchingZapArgs
    }
  }
}
