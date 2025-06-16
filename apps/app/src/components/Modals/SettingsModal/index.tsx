import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { CURRENCY_ID, LANGUAGE_ID, MODAL_KEYS, useIsModalOpen } from '@shared/generic-react-hooks'
import { Modal } from '@shared/ui'
import { ReactNode, useMemo } from 'react'
import { useSettingsModalView } from '@hooks/useSettingsModalView'
import { CurrencyView } from './Views/CurrencyView'
import { LanguageView } from './Views/LanguageView'
import { MenuView } from './Views/MenuView'

export type SettingsModalOption = 'currency' | 'language'

export type SettingsModalView = 'menu' | SettingsModalOption

export interface SettingsModalProps {
  locales?: LANGUAGE_ID[]
  disable?: SettingsModalOption[]
  hide?: SettingsModalOption[]
  onCurrencyChange?: (id: CURRENCY_ID) => void
  onLanguageChange?: (id: LANGUAGE_ID) => void
  onVaultListImport?: (id: string) => void
  onRpcChange?: () => void
}

export const SettingsModal = (props: SettingsModalProps) => {
  const { locales, disable, hide, onCurrencyChange, onLanguageChange } = props

  const { view, setView } = useSettingsModalView()

  const { isModalOpen, setIsModalOpen } = useIsModalOpen(MODAL_KEYS.settings)

  const modalViews: Record<SettingsModalView, ReactNode> = {
    menu: <MenuView disable={disable} hide={hide} />,
    currency: <CurrencyView onCurrencyChange={onCurrencyChange} />,
    language: <LanguageView locales={locales} onLanguageChange={onLanguageChange} />
  }

  if (isModalOpen) {
    return (
      <Modal
        headerContent={
          view !== 'menu' ? (
            <ArrowLeftIcon
              className='h-6 w-6 text-pt-purple-100 cursor-pointer'
              onClick={() => setView('menu')}
            />
          ) : undefined
        }
        bodyContent={modalViews[view]}
        onClose={() => {
          setIsModalOpen(false)
          setView('menu')
        }}
        label='settings'
        mobileStyle='cover'
      />
    )
  }

  return <></>
}
