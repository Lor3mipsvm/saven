import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSendDelegateTransaction,
  useUserVaultDelegate,
  useVaultTokenData
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { TransactionButton } from '@shared/react-components'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { addRecentTransaction } from 'src/utils'
import { Address, isAddress } from 'viem'
import { DelegateModalView } from '.'
import { delegateFormNewDelegateAddressAtom } from './DelegateForm'

interface DelegateTxButtonProps {
  twabController: Address
  vault: Vault
  setModalView: (view: DelegateModalView) => void
  setDelegateTxHash: (txHash: string) => void
  onSuccessfulDelegation?: () => void
}

export const DelegateTxButton = (props: DelegateTxButtonProps) => {
  const { twabController, vault, setModalView, setDelegateTxHash, onSuccessfulDelegation } = props

  const t_txModals = useTranslations('TxModals')
  const t_common = useTranslations('Common')

  const { address: userAddress, chain, isDisconnected } = useAccount()

  const { data: tokenData } = useVaultTokenData(vault)

  const newDelegateAddress: Address | undefined = useAtomValue(delegateFormNewDelegateAddressAtom)

  const { data: delegate, refetch: refetchUserVaultDelegate } = useUserVaultDelegate(
    vault,
    userAddress!,
    { refetchOnWindowFocus: true }
  )

  const dataTx = useSendDelegateTransaction(twabController, newDelegateAddress, vault, {
    onSend: () => {
      setModalView('waiting')
    },
    onSuccess: () => {
      refetchUserVaultDelegate()
      onSuccessfulDelegation?.()
      setModalView('main')
    },
    onError: () => {
      setModalView('error')
    }
  })

  // const { data: walletCapabilities } = useCapabilities()
  // const chainWalletCapabilities = walletCapabilities?.[vault.chainId] ?? {}
  const chainWalletCapabilities = {}

  const sendTx = dataTx.sendDelegateTransaction
  const isWaitingDelegation = dataTx.isWaiting
  const isConfirmingDelegation = dataTx.isConfirming
  const isSuccessfulDelegation = dataTx.isSuccess
  const delegateTxHash = dataTx.txHash

  useEffect(() => {
    if (
      !!delegateTxHash &&
      isConfirmingDelegation &&
      !isWaitingDelegation &&
      !isSuccessfulDelegation
    ) {
      setDelegateTxHash(delegateTxHash)
      setModalView('confirming')
    }
  }, [delegateTxHash, isConfirmingDelegation])

  const hasDelegateAddressChanged = newDelegateAddress !== delegate

  const delegateEnabled =
    !isDisconnected &&
    !!userAddress &&
    !!newDelegateAddress &&
    isAddress(newDelegateAddress) &&
    !isWaitingDelegation &&
    !isConfirmingDelegation &&
    hasDelegateAddressChanged &&
    !!sendTx

  return (
    <TransactionButton
      chainId={vault.chainId}
      isTxLoading={isWaitingDelegation || isConfirmingDelegation}
      isTxSuccess={isSuccessfulDelegation}
      write={sendTx}
      txHash={delegateTxHash}
      txDescription={t_txModals('delegateTx', { symbol: tokenData?.symbol ?? '?' })}
      fullSized={true}
      disabled={!delegateEnabled}
      color={!delegateEnabled && chain?.id === vault.chainId ? 'transparent' : 'teal'}
      addRecentTransaction={addRecentTransaction}
      intl={{ common: t_common }}
    >
      {t_txModals('updateDelegatedAddress')}
    </TransactionButton>
  )
}
