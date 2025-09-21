import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { erc20ABI, vaultABI } from '@shared/utilities'
import { useEffect } from 'react'
import { Address, TransactionReceipt } from 'viem'
import { useAccount } from 'wagmi'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useTokenAllowance, useVaultTokenAddress } from '..'

/**
 * Prepares and submits a deposit transaction to a vault (non-EIP-5792)
 * @param amount the amount to deposit
 * @param vault the vault to deposit into
 * @param options optional settings and callbacks
 * @returns
 */
export const useSendDepositTransaction = (
    amount: bigint,
    vault: Vault,
    options?: {
        paymasterService?: { url: string; optional: boolean }
        onSend?: (txHash: `0x${string}`) => void
        onSuccess?: (txReceipt: TransactionReceipt) => void
        onError?: () => void
        enabled?: boolean
    }
) => {
    const { address: userAddress, chain } = useAccount()

    const { data: tokenAddress, isFetched: isFetchedTokenAddress } = useVaultTokenAddress(vault)

    const { data: allowance, isFetched: isFetchedAllowance } = useTokenAllowance(
        vault?.chainId,
        userAddress!,
        vault?.address,
        tokenAddress!
    )

    const enabled =
        !!amount &&
        !!vault &&
        isFetchedTokenAddress &&
        !!tokenAddress &&
        !!userAddress &&
        chain?.id === vault.chainId &&
        isFetchedAllowance &&
        allowance !== undefined &&
        allowance >= amount &&
        options?.enabled !== false

    const { data, error: simulateError } = useSimulateContract({
        chainId: vault?.chainId,
        address: vault?.address,
        abi: vaultABI,
        functionName: 'deposit',
        args: [amount, userAddress!],
        query: { enabled }
    })

    const {
        data: txHash,
        isPending: isWaiting,
        isError: isSendingError,
        isSuccess: isSendingSuccess,
        writeContract: _sendDepositTransaction
    } = useWriteContract()

    const sendDepositTransaction = !!data
        ? () => _sendDepositTransaction(data.request)
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

    const isError = isSendingError || isConfirmingError || !!simulateError

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
        sendDepositTransaction
    }
}
