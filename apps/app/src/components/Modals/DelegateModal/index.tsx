import {
  useSelectedVault,
  useVaultTwabController
} from '@generationsoftware/hyperstructure-react-hooks'
import { MODAL_KEYS, useIsModalOpen } from '@shared/generic-react-hooks'
import { Modal } from '@shared/ui'
import { useState } from 'react'
import { DelegateModalBody } from './DelegateModalBody'
import { DelegateTxButton } from './DelegateTxButton'

export type DelegateModalView = 'main' | 'waiting' | 'confirming' | 'success' | 'error'

export interface DelegateModalProps {
  onClose?: () => void
  onSuccessfulDelegation?: () => void
}

export const DelegateModal = (props: DelegateModalProps) => {
  const { onClose, onSuccessfulDelegation } = props

  const { vault } = useSelectedVault()

  const { isModalOpen, setIsModalOpen } = useIsModalOpen(MODAL_KEYS.delegate, { onClose })

  const [view, setView] = useState<DelegateModalView>('main')

  const [delegateTxHash, setDelegateTxHash] = useState<string>()

  const { data: twabController } = useVaultTwabController(vault!)

  const txInFlight = !delegateTxHash && view === 'confirming'

  const handleClose = () => {
    if (txInFlight) {
      return
    }
    setIsModalOpen(false)
    setView('main')
  }

  if (isModalOpen && !!vault) {
    const modalBodyContent = <DelegateModalBody modalView={view} vault={vault} />

    const modalFooterContent = (
      <div className={'flex flex-col items-center gap-6'}>
        <DelegateTxButton
          twabController={twabController!}
          vault={vault}
          setModalView={setView}
          setDelegateTxHash={setDelegateTxHash}
          onSuccessfulDelegation={onSuccessfulDelegation}
        />
      </div>
    )

    return (
      <Modal
        bodyContent={modalBodyContent}
        footerContent={modalFooterContent}
        onClose={handleClose}
        preventClose={txInFlight}
        label='delegate-flow'
        hideHeader={true}
        mobileStyle='tab'
      />
    )
  }

  return <></>
}
