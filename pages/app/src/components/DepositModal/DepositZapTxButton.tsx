import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useSendDepositZapTransaction,
    useSendGenericApproveTransaction,
    useToken,
    useTokenAllowance,
    useTokenBalance,
    useUserVaultDelegationBalance,
    useUserVaultTokenBalance,
    useVaultBalance,
    useVaultTokenAddress,
    useAccount
} from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { Address, Hash, parseUnits } from 'viem'
import { DepositModalView } from '.'
import { depositFormTokenAmountAtom, depositFormTokenAddressAtom } from '@/lib/atoms/depositAtoms'

interface DepositZapTxButtonProps {
    vault: Vault
    modalView: string
    setModalView: (view: DepositModalView) => void
    setDepositTxHash: (txHash: string) => void
    refetchUserBalances?: () => void
    onSuccessfulApproval?: () => void
    onSuccessfulDepositWithZap?: (chainId: number, txHash: Hash) => void
}

export const DepositZapTxButton = (props: DepositZapTxButtonProps) => {
    const {
        vault,
        modalView,
        setModalView,
        setDepositTxHash,
        refetchUserBalances,
        onSuccessfulApproval,
        onSuccessfulDepositWithZap
    } = props

    const { address: userAddress, chain, isDisconnected } = useAccount()

    const formInputTokenAddress = useAtomValue(depositFormTokenAddressAtom)
    const formInputTokenAmount = useAtomValue(depositFormTokenAmountAtom)

    const { data: vaultTokenAddress } = useVaultTokenAddress(vault)

    const inputTokenAddress = formInputTokenAddress ?? vaultTokenAddress

    const { data: inputToken } = useToken(vault.chainId, inputTokenAddress!)

    const {
        data: allowance,
        isFetched: isFetchedAllowance,
        refetch: refetchTokenAllowance
    } = useTokenAllowance(
        vault.chainId,
        userAddress!,
        '0x1234567890123456789012345678901234567890', // Zap token manager address - would need to be configured
        inputToken?.address!
    )

    const {
        data: userTokenBalance,
        isFetched: isFetchedUserTokenBalance,
        refetch: refetchUserTokenBalance
    } = useTokenBalance(vault.chainId, userAddress!, inputToken?.address!)

    const { refetch: refetchUserVaultTokenBalance } = useUserVaultTokenBalance(vault, userAddress!)
    const { refetch: refetchUserVaultDelegationBalance } = useUserVaultDelegationBalance(
        vault,
        userAddress!
    )
    const { refetch: refetchVaultBalance } = useVaultBalance(vault)

    const depositAmount = inputToken?.decimals !== undefined
        ? parseUnits(formInputTokenAmount, inputToken.decimals)
        : 0n

    const dataTx = useSendDepositZapTransaction(
        { address: inputToken?.address!, decimals: inputToken?.decimals!, amount: depositAmount },
        vault,
        {
            onSend: () => {
                setModalView('waiting')
            },
            onSuccess: (callReceipts) => {
                setTimeout(() => {
                    refetchUserTokenBalance()
                    refetchUserVaultTokenBalance()
                    refetchUserVaultDelegationBalance()
                    refetchVaultBalance()
                    refetchTokenAllowance()
                    refetchUserBalances?.()
                }, 7000)

                onSuccessfulDepositWithZap?.(vault.chainId, callReceipts.at(-1)?.transactionHash!)
                setModalView('success')
            },
            onError: (error: Error) => {
                console.error('Zap transaction error:', error)
                setModalView('error')
            }
        }
    )

    const isWaitingZap = dataTx.isWaiting
    const isConfirmingZap = dataTx.isConfirming
    const isSuccessfulZap = dataTx.isSuccess
    const zapTxHash = dataTx.txHashes?.at(-1)
    const sendZapTransaction = dataTx.sendDepositZapTransaction

    useEffect(() => {
        if (!!zapTxHash && !isWaitingZap) {
            setDepositTxHash(zapTxHash)
        }
    }, [zapTxHash, isConfirmingZap])

    const isDataFetched =
        !isDisconnected &&
        !!userAddress &&
        !!inputToken &&
        isFetchedUserTokenBalance &&
        !!userTokenBalance &&
        isFetchedAllowance &&
        allowance !== undefined &&
        !!depositAmount &&
        chain?.id === vault.chainId

    const zapEnabled =
        isDataFetched &&
        userTokenBalance.amount >= depositAmount &&
        isValidFormInput(formInputTokenAmount, inputToken?.decimals ?? 18) &&
        !!sendZapTransaction

    // No deposit amount set
    if (depositAmount === 0n) {
        return (
            <Button
                className="w-full bg-slate-700 text-slate-400 border-slate-600"
                disabled={true}
            >
                Enter an amount
            </Button>
        )
    }

    // Zap button
    return (
        <Button
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={sendZapTransaction}
            disabled={!zapEnabled || isWaitingZap || isConfirmingZap}
        >
            {isWaitingZap || isConfirmingZap ? 'Processing Zap...' : 'Confirm Zap Deposit'}
        </Button>
    )
}

// Helper function for form validation
const isValidFormInput = (value: string, decimals: number): boolean => {
    if (!value || value === '') return false
    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`)
    return regex.test(value) && parseFloat(value) > 0
}
