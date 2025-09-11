import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useSelectedVault,
    useVaultExchangeRate,
    useVaultTokenData,
    useSupportedPrizePools
} from '@/lib/hooks'
import { useAtom, useSetAtom } from 'jotai'
import { ReactNode, useMemo, useState } from 'react'
import { Hash } from 'viem'
import {
    depositFormShareAmountAtom,
    depositFormTokenAddressAtom,
    depositFormTokenAmountAtom,
    depositModalOpenAtom,
    depositModalViewAtom,
    depositTxHashAtom
} from '@/lib/atoms/depositAtoms'
import { DepositTxButton } from './DepositTxButton'
import { DepositZapTxButton } from './DepositZapTxButton'
import { ConfirmingView } from './views/ConfirmingView'
import { ErrorView } from './views/ErrorView'
import { MainView } from './views/MainView'
import { ReviewView } from './views/ReviewView'
import { SuccessView } from './views/SuccessView'
import { WaitingView } from './views/WaitingView'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type DepositModalView = 'main' | 'review' | 'waiting' | 'confirming' | 'success' | 'error'

export interface DepositModalProps {
    vault?: Vault
    onClose?: () => void
    refetchUserBalances?: () => void
    onSuccessfulApproval?: () => void
    onSuccessfulDeposit?: (chainId: number, txHash: Hash) => void
    onSuccessfulDepositWithZap?: (chainId: number, txHash: Hash) => void
}

export const DepositModal = (props: DepositModalProps) => {
    const {
        vault: propVault,
        onClose,
        refetchUserBalances,
        onSuccessfulApproval,
        onSuccessfulDeposit,
        onSuccessfulDepositWithZap
    } = props

    const { vault: contextVault } = useSelectedVault()
    const vault = propVault || contextVault

    const [isModalOpen, setIsModalOpen] = useAtom(depositModalOpenAtom)
    const [view, setView] = useAtom(depositModalViewAtom)
    const [depositTxHash, setDepositTxHash] = useAtom(depositTxHashAtom)

    const [formTokenAddress, setFormTokenAddress] = useAtom(depositFormTokenAddressAtom)
    const setFormTokenAmount = useSetAtom(depositFormTokenAmountAtom)
    const setFormShareAmount = useSetAtom(depositFormShareAmountAtom)

    // Guard against opening modal without vault
    const canOpen = isModalOpen && vault

    const { data: vaultToken } = useVaultTokenData(vault!)
    const { data: vaultExchangeRate } = useVaultExchangeRate(vault!)
    const prizePools = useSupportedPrizePools()

    const prizePool = useMemo(() => {
        if (!!vault) {
            return Object.values(prizePools).find((prizePool) => prizePool.chainId === vault.chainId)
        }
    }, [prizePools, vault])

    const txInFlight = !depositTxHash && view === 'confirming'

    const handleClose = () => {
        if (txInFlight) {
            return
        }
        setIsModalOpen(false)
        setView('main')
        setFormTokenAddress(undefined)
        setFormTokenAmount('')
        setFormShareAmount('')
        setDepositTxHash(undefined)
        onClose?.()
    }

    const handleError = (error: Error) => {
        console.error('DepositModal error:', error)
        setView('error')
    }

    if (!isModalOpen) {
        return null
    }

    if (!vault) {
        return (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white text-center">
                            Loading...
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 text-center">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading vault data...</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    const modalViews: Record<DepositModalView, ReactNode> = {
        main: <MainView vault={vault} prizePool={prizePool!} />,
        review: <ReviewView vault={vault} prizePool={prizePool!} />,
        waiting: <WaitingView vault={vault} closeModal={handleClose} />,
        confirming: <ConfirmingView vault={vault} txHash={depositTxHash} closeModal={handleClose} />,
        success: <SuccessView vault={vault} txHash={depositTxHash} />,
        error: <ErrorView setModalView={setView} />
    }

    const isZapping =
        !!vaultToken && !!formTokenAddress && vaultToken.address.toLowerCase() !== formTokenAddress.toLowerCase()

    const modalFooterContent = !!vaultExchangeRate ? (
        <div className={`flex flex-col items-center gap-8 ${view !== 'main' && view !== 'review' ? 'hidden' : ''}`}>
            {isZapping ? (
                <DepositZapTxButton
                    vault={vault}
                    modalView={view}
                    setModalView={setView}
                    setDepositTxHash={setDepositTxHash}
                    refetchUserBalances={refetchUserBalances}
                    onSuccessfulApproval={onSuccessfulApproval}
                    onSuccessfulDepositWithZap={onSuccessfulDepositWithZap}
                />
            ) : (
                <DepositTxButton
                    vault={vault}
                    modalView={view}
                    setModalView={setView}
                    setDepositTxHash={setDepositTxHash}
                    refetchUserBalances={refetchUserBalances}
                    onSuccessfulApproval={onSuccessfulApproval}
                    onSuccessfulDeposit={onSuccessfulDeposit}
                />
            )}
            {view === 'main' && <DepositDisclaimer vault={vault} />}
        </div>
    ) : undefined

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white text-center">
                        Deposit to Vault
                    </DialogTitle>
                </DialogHeader>
                <div className="isolate">
                    {modalViews[view]}
                </div>
                {modalFooterContent && (
                    <div className="mt-6">
                        {modalFooterContent}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

interface DepositDisclaimerProps {
    vault: Vault
}

const DepositDisclaimer = (props: DepositDisclaimerProps) => {
    const { vault } = props

    return (
        <span className="text-sm text-gray-400 text-center leading-normal">
            By depositing, you agree to our{' '}
            <button className="text-amber-400 hover:text-amber-300">
                Terms of Service
            </button>
            {' '}and understand that your funds will be deposited into the{' '}
            <a
                href={`/vault/${vault.chainId}/${vault.address}`}
                target="_blank"
                className="text-amber-400 hover:text-amber-300"
            >
                {vault.name || 'vault'}
            </a>
            .
        </span>
    )
}
