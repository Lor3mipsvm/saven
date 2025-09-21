import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useSend5792DepositTransaction,
    useTokenAllowance,
    useTokenBalance,
    useUserVaultDelegationBalance,
    useUserVaultTokenBalance,
    useVaultBalance,
    useVaultTokenData,
    useAccount
} from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { Address, Hash, parseUnits } from 'viem'
import { DepositModalView } from '.'
import { depositFormTokenAmountAtom } from '@/lib/atoms/depositAtoms'

interface DepositTxButtonProps {
    vault: Vault
    modalView: string
    setModalView: (view: DepositModalView) => void
    setDepositTxHash: (txHash: string) => void
    refetchUserBalances?: () => void
    onSuccessfulApproval?: () => void
    onSuccessfulDeposit?: (chainId: number, txHash: Hash) => void
}

export const DepositTxButton = (props: DepositTxButtonProps) => {
    const {
        vault,
        modalView,
        setModalView,
        setDepositTxHash,
        refetchUserBalances,
        onSuccessfulDeposit
    } = props

    const { address: userAddress, chain, isDisconnected } = useAccount()

    const { data: tokenData } = useVaultTokenData(vault)
    const decimals = vault.decimals ?? tokenData?.decimals

    // --- EARLY GATE: don't call any address-dependent hooks yet ---
    if (
        isDisconnected ||
        !userAddress ||
        !tokenData?.address ||
        decimals === undefined ||
        chain?.id !== vault.chainId
    ) {
        return (
            <Button className="w-full bg-slate-700 text-slate-400 border-slate-600" disabled>
                {isDisconnected || !userAddress ? 'Connect your wallet' : 'Loading token…'}
            </Button>
        )
    }

    // Safe to call hooks now:
    const { data: allowance, isFetched: isFetchedAllowance, refetch: refetchTokenAllowance } =
        useTokenAllowance(vault.chainId, userAddress as Address, vault.address, tokenData.address as Address)
    const { data: userTokenBalance, isFetched: isFetchedUserTokenBalance, refetch: refetchUserTokenBalance } =
        useTokenBalance(vault.chainId, userAddress as Address, tokenData.address as Address)
    const { refetch: refetchUserVaultTokenBalance } = useUserVaultTokenBalance(vault, userAddress as Address)
    const { refetch: refetchUserVaultDelegationBalance } = useUserVaultDelegationBalance(vault, userAddress as Address)
    const { refetch: refetchVaultBalance } = useVaultBalance(vault)

    const formTokenAmount = useAtomValue(depositFormTokenAmountAtom)

    const isValidFormTokenAmount =
        decimals !== undefined ? isValidFormInput(formTokenAmount, decimals) : false

    const depositAmount = isValidFormTokenAmount
        ? parseUnits(formTokenAmount, decimals as number)
        : 0n

    const isUsingEip5792 = true

    const data5792DepositTx = useSend5792DepositTransaction(depositAmount, vault, {
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

            onSuccessfulDeposit?.(vault.chainId, callReceipts.at(-1)?.transactionHash!)
            setModalView('success')
        },
        onError: (error: Error) => {
            console.error('Deposit transaction error:', error)
            setModalView('error')
        },
        enabled: isUsingEip5792
    })

    const isWaitingDeposit = data5792DepositTx.isWaiting
    const isConfirmingDeposit = data5792DepositTx.isConfirming
    const isSuccessfulDeposit = data5792DepositTx.isSuccess
    const depositTxHash = data5792DepositTx.txHashes?.at(-1)
    const sendDepositTransaction = data5792DepositTx.send5792DepositTransaction

    useEffect(() => {
        if (depositTxHash && !isWaitingDeposit) {
            setDepositTxHash(depositTxHash)
        }
    }, [depositTxHash, isWaitingDeposit])

    const needsAllowance = !isUsingEip5792
    const hasAllowanceData = !needsAllowance || (isFetchedAllowance && allowance !== undefined)

    const isDataFetched =
        !isDisconnected &&
        !!userAddress &&
        !!tokenData &&
        isFetchedUserTokenBalance &&
        !!userTokenBalance &&
        hasAllowanceData &&
        !!depositAmount &&
        decimals !== undefined &&
        chain?.id === vault.chainId

    const depositEnabled =
        isDataFetched &&
        !!sendDepositTransaction &&                    // ✅ must have a sender fn
        userTokenBalance.amount >= depositAmount &&
        (!needsAllowance || allowance >= depositAmount) &&
        isValidFormTokenAmount

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

    // Deposit button
    return (
        <Button
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={sendDepositTransaction}
            disabled={!depositEnabled || isWaitingDeposit || isConfirmingDeposit}
        >
            {isWaitingDeposit || isConfirmingDeposit ? 'Processing...' : 'Confirm Deposit'}
        </Button>
    )
}

// Helper function for form validation
const isValidFormInput = (value: string, decimals: number): boolean => {
    if (!value || value === '') return false

    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`)
    return regex.test(value) && parseFloat(value) > 0
}
