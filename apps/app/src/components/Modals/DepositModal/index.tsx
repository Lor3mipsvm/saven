// Removed OnchainKit - using window.open instead
import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSelectedVault,
  useVaultExchangeRate,
  useVaultTokenData
} from '@generationsoftware/hyperstructure-react-hooks'
import { MODAL_KEYS, useIsModalOpen } from '@shared/generic-react-hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog'
import { LINKS, lower } from '@shared/utilities'
import classNames from 'classnames'
import { useAtom, useSetAtom } from 'jotai'
import { useTranslations } from 'next-intl'
import { ReactNode, useMemo, useState } from 'react'
import { Hash } from 'viem'
import { useSupportedPrizePools } from '@hooks/useSupportedPrizePools'
import {
  depositFormShareAmountAtom,
  depositFormTokenAddressAtom,
  depositFormTokenAmountAtom
} from './DepositForm'
import { DepositTxButton } from './DepositTxButton'
import { DepositZapTxButton } from './DepositZapTxButton'
import { ConfirmingView } from './Views/ConfirmingView'
import { ErrorView } from './Views/ErrorView'
import { MainView } from './Views/MainView'
import { ReviewView } from './Views/ReviewView'
import { SuccessView } from './Views/SuccessView'
import { WaitingView } from './Views/WaitingView'

export type DepositModalView = 'main' | 'review' | 'waiting' | 'confirming' | 'success' | 'error'

export interface DepositModalProps {
  onClose?: () => void
  refetchUserBalances?: () => void
  onSuccessfulApproval?: () => void
  onSuccessfulDeposit?: (chainId: number, txHash: Hash) => void
  onSuccessfulDepositWithZap?: (chainId: number, txHash: Hash) => void
  selectedCabanaVault?: any
}

export const DepositModal = (props: DepositModalProps) => {
  const {
    onClose,
    refetchUserBalances,
    onSuccessfulApproval,
    onSuccessfulDeposit,
    onSuccessfulDepositWithZap,
    selectedCabanaVault
  } = props

  const { vault } = useSelectedVault()

  const { isModalOpen, setIsModalOpen } = useIsModalOpen(MODAL_KEYS.deposit, { onClose })

  const [view, setView] = useState<DepositModalView>('main')

  const [depositTxHash, setDepositTxHash] = useState<string>()

  const [formTokenAddress, setFormTokenAddress] = useAtom(depositFormTokenAddressAtom)
  const setFormTokenAmount = useSetAtom(depositFormTokenAmountAtom)
  const setFormShareAmount = useSetAtom(depositFormShareAmountAtom)

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
    setDepositTxHash('')
  }

  if (isModalOpen && !!vault) {
    const modalViews: Record<DepositModalView, ReactNode> = {
      main: <MainView vault={vault} prizePool={prizePool!} selectedCabanaVault={selectedCabanaVault} />,
      review: <ReviewView vault={vault} prizePool={prizePool!} selectedCabanaVault={selectedCabanaVault} />,
      waiting: <WaitingView vault={vault} closeModal={handleClose} />,
      confirming: <ConfirmingView vault={vault} txHash={depositTxHash} closeModal={handleClose} />,
      success: <SuccessView vault={vault} txHash={depositTxHash} />,
      error: <ErrorView setModalView={setView} />
    }

    const isZapping =
      !!vaultToken && !!formTokenAddress && lower(vaultToken.address) !== lower(formTokenAddress)

    const modalFooterContent = !!vaultExchangeRate ? (
      <div
        className={classNames('flex flex-col items-center gap-8', {
          hidden: view !== 'main' && view !== 'review'
        })}
      >
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
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md bg-slate-900/95 backdrop-blur-sm border border-amber-500/20 text-white shadow-2xl p-6">
          <div className="isolate">{modalViews[view]}</div>
          {modalFooterContent && <div className="mt-6">{modalFooterContent}</div>}
        </DialogContent>
      </Dialog>
    )
  }

  return <></>
}

interface DepositDisclaimerProps {
  vault: Vault
}

const DepositDisclaimer = (props: DepositDisclaimerProps) => {
  const { vault } = props

  const openUrl = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')

  const t_modals = useTranslations('TxModals')

  return (
    <span className='text-sm text-slate-300 text-center leading-normal'>
      {t_modals.rich('depositDisclaimer', {
        tosLink: (chunks) => (
          <button onClick={() => openUrl(LINKS.termsOfService)} className='text-amber-400 hover:text-amber-300'>
            {chunks}
          </button>
        ),
        vaultLink: (chunks) => (
          <a
            href={`/vault/${vault.chainId}/${vault.address}`}
            target='_blank'
            className='text-amber-400 hover:text-amber-300'
          >
            {chunks}
          </a>
        )
      })}
    </span>
  )
}
