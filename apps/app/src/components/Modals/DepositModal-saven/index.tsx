import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useSelectedVault,
    useSupportedPrizePools,
    useAccount,
    useVaultExchangeRate,
    useVaultTokenData
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
    const { vault: propVault, onClose, ...rest } = props
    const [isModalOpen, setIsModalOpen] = useAtom(depositModalOpenAtom)
    const [view, setView] = useAtom(depositModalViewAtom)
    const [depositTxHash, setDepositTxHash] = useAtom(depositTxHashAtom)
    const [formTokenAddress, setFormTokenAddress] = useAtom(depositFormTokenAddressAtom)
    const setFormTokenAmount = useSetAtom(depositFormTokenAmountAtom)
    const setFormShareAmount = useSetAtom(depositFormShareAmountAtom)

    const { vault: contextVault } = useSelectedVault()
    const vault = propVault || contextVault

    // ❗ Call ALL hooks BEFORE any early returns
    const prizePools = useSupportedPrizePools()            // always called
    const prizePool = useMemo(() => {
        if (!vault) return undefined
        const map = prizePools ?? {}
        return Object.values(map).find((p) => p.chainId === vault.chainId)
    }, [prizePools, vault])

    // ✅ if closed, render nothing (consistent across renders)
    if (!isModalOpen) return null

    const txInFlight = !depositTxHash && view === 'confirming'
    const handleClose = () => {
        if (txInFlight) return
        setIsModalOpen(false)
        setView('main')
        setFormTokenAddress(undefined)
        setFormTokenAmount('')
        setFormShareAmount('')
        setDepositTxHash(undefined)
        onClose?.()
    }



    return (
        <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
                if (open) setIsModalOpen(true)
                else handleClose()   // <- resets view, amounts, tx hash
            }}
        >
            <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white text-center">
                        Deposit to Vault
                    </DialogTitle>
                </DialogHeader>
                {/* One stable Dialog subtree; swap inner content only */}
                {!vault && (
                    <div className="p-6 text-center">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading vault data…</p>
                    </div>
                )}
                {vault && !prizePool && (
                    <div className="p-6 text-center">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading prize pool…</p>
                    </div>
                )}
                {vault && prizePool && (
                    <DepositModalInner
                        vault={vault}
                        prizePool={prizePool}
                        view={view}
                        setView={setView}
                        depositTxHash={depositTxHash}
                        setDepositTxHash={setDepositTxHash}
                        onClose={handleClose}
                        {...rest}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

// 🚫 Put ALL vault-dependent hooks here (child mounts only when vault & prizePool exist)
const DepositModalInner = ({
    vault, prizePool, view, setView, depositTxHash, setDepositTxHash, onClose,
    refetchUserBalances, onSuccessfulApproval, onSuccessfulDeposit, onSuccessfulDepositWithZap
}: {
    vault: Vault; prizePool: any; view: DepositModalView; setView: (v: DepositModalView) => void;
    depositTxHash?: string; setDepositTxHash: (h: string) => void; onClose: () => void;
    refetchUserBalances?: () => void; onSuccessfulApproval?: () => void;
    onSuccessfulDeposit?: (chainId: number, tx: Hash) => void;
    onSuccessfulDepositWithZap?: (chainId: number, tx: Hash) => void;
}) => {
    const { address: userAddress, isDisconnected } = useAccount()
    const { data: vaultToken } = useVaultTokenData(vault)
    const { data: vaultExchangeRate } = useVaultExchangeRate(vault)

    const mainNode =
        isDisconnected || !userAddress
            ? <div className="p-6 text-center text-slate-300">Connect your wallet to deposit.</div>
            : <MainView vault={vault} prizePool={prizePool} />

    const modalViews: Record<DepositModalView, React.ReactNode> = {
        main: mainNode,
        review: <ReviewView vault={vault} prizePool={prizePool} />,
        waiting: <WaitingView vault={vault} closeModal={onClose} />,
        confirming: <ConfirmingView vault={vault} txHash={depositTxHash} closeModal={onClose} />,
        success: <SuccessView vault={vault} txHash={depositTxHash} />,
        error: <ErrorView setModalView={setView} />
    }

    const [formTokenAddress] = useAtom(depositFormTokenAddressAtom)
    const isZapping =
        !!vaultToken &&
        !!formTokenAddress &&
        vaultToken.address.toLowerCase() !== formTokenAddress.toLowerCase()

    const footer =
        (view === 'main' || view === 'review') ? (
            <div className="flex flex-col items-center gap-8">
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
        ) : null

    return (
        <>
            <div className="isolate">{modalViews[view]}</div>
            {footer && <div className="mt-6">{footer}</div>}
        </>
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
