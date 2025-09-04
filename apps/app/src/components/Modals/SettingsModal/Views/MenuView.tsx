import { useOpenUrl } from '@coinbase/onchainkit/minikit'
import { ArrowTopRightOnSquareIcon, SparklesIcon } from '@heroicons/react/24/outline'
import {
  SUPPORTED_CURRENCIES,
  useSelectedCurrency,
  useSelectedLanguage
} from '@shared/generic-react-hooks'
import { BasicIcon } from '@shared/ui'
import { LINKS } from '@shared/utilities'
import classNames from 'classnames'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'
import { useAcceptHeaderLanguage } from '@hooks/useAcceptHeaderLanguage'
import { useSettingsModalView } from '@hooks/useSettingsModalView'
import { SettingsModalOption } from '..'

interface MenuViewProps {
  disable?: SettingsModalOption[]
  hide?: SettingsModalOption[]
}

export const MenuView = (props: MenuViewProps) => {
  const { disable, hide } = props

  const openUrl = useOpenUrl()

  const t = useTranslations('Settings')

  const { setView: setSettingsModalView } = useSettingsModalView()

  const { selectedCurrency } = useSelectedCurrency()
  const { selectedLanguage } = useSelectedLanguage()
  const { acceptHeaderLanguage } = useAcceptHeaderLanguage()

  return (
    <div className='flex flex-col gap-4'>
      <SettingsMenuSection
        title={t('customizeExperience')}
        items={[
          {
            iconContent: selectedLanguage?.toUpperCase() || acceptHeaderLanguage.toUpperCase(),
            iconClassName: '!text-base font-semibold',
            title: t('changeLanguage'),
            onClick: () => setSettingsModalView('language'),
            disabled: disable?.includes('language'),
            hidden: hide?.includes('language')
          },
          {
            iconContent: SUPPORTED_CURRENCIES[selectedCurrency].symbol,
            title: t('changeCurrency'),
            onClick: () => setSettingsModalView('currency'),
            disabled: disable?.includes('currency'),
            hidden: hide?.includes('currency')
          },
          {
            iconContent: <SparklesIcon className='h-6 w-6 text-pt-purple-100' />,
            title: t('viewEcosystem'),
            onClick: () => openUrl(LINKS.ecosystem),
            isExternalLink: true
          }
        ]}
      />
      <SettingsMenuSection
        title={t('getHelp')}
        items={[
          {
            iconContent: '?',
            iconClassName: 'font-semibold',
            title: t('getHelpWithCabana'),
            onClick: () => openUrl(LINKS.docs),
            isExternalLink: true
          }
        ]}
      />
    </div>
  )
}

interface SettingsMenuSectionProps {
  title: string
  items: SettingsMenuItemProps[]
}

const SettingsMenuSection = (props: SettingsMenuSectionProps) => {
  const { title, items } = props

  return (
    <div className='flex flex-col gap-3'>
      <span className='text-xl font-semibold text-pt-purple-50 md:text-2xl'>{title}</span>
      {items.map((item) => {
        return (
          <SettingsMenuItem
            key={`st-item-${item.title.toLowerCase().replaceAll(' ', '-')}`}
            {...item}
          />
        )
      })}
    </div>
  )
}

interface SettingsMenuItemProps {
  iconContent: ReactNode
  title: string
  onClick: () => void
  isExternalLink?: boolean
  iconClassName?: string
  disabled?: boolean
  hidden?: boolean
}

const SettingsMenuItem = (props: SettingsMenuItemProps) => {
  const { iconContent, title, onClick, isExternalLink, iconClassName, disabled, hidden } = props

  return (
    <div
      className={classNames(
        'flex gap-2 w-full items-center rounded-lg px-6 py-3 select-none relative bg-pt-transparent hover:bg-pt-transparent/5',
        { 'cursor-pointer': !disabled, 'brightness-50': disabled },
        { hidden: hidden }
      )}
      onClick={() => {
        if (!disabled) {
          onClick()
        }
      }}
    >
      <BasicIcon
        content={iconContent}
        size='lg'
        theme='dark'
        className={classNames('mr-1', iconClassName)}
      />
      <span className='flex items-center text-pt-purple-50'>{title}</span>
      {isExternalLink && (
        <ArrowTopRightOnSquareIcon className='h-5 w-5 shrink-0 text-pt-purple-200 stroke-2' />
      )}
    </div>
  )
}
