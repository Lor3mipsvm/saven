import { useOpenUrl } from '@coinbase/onchainkit/minikit'
import { MODAL_KEYS, useIsModalOpen } from '@shared/generic-react-hooks'
import { SocialIcon } from '@shared/ui'
import { LINKS } from '@shared/utilities'
import classNames from 'classnames'
import { Footer as FlowbiteFooter } from 'flowbite-react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { useSettingsModalView } from '@hooks/useSettingsModalView'

interface FooterItem {
  title: string
  content: FooterItemContentProps[]
  className?: string
  titleClassName?: string
  itemClassName?: string
}

export const Footer = () => {
  const t_settings = useTranslations('Settings')
  const t_footer = useTranslations('Footer')

  const { setIsModalOpen: setIsSettingsModalOpen } = useIsModalOpen(MODAL_KEYS.settings)
  const { setView: setSettingsModalView } = useSettingsModalView()

  const { setIsModalOpen: setIsCaptchaModalOpen } = useIsModalOpen(MODAL_KEYS.captcha)

  const openUrl = useOpenUrl()

  // NOTE: This is necessary due to hydration errors otherwise.
  const [isBrowser, setIsBrowser] = useState(false)
  useEffect(() => setIsBrowser(true), [])

  const footerItems: FooterItem[] = [
    {
      title: t_footer('titles.getHelp'),
      content: [
        { content: t_footer('userDocs'), onClick: () => openUrl(LINKS.docs) },
        { content: t_footer('devDocs'), onClick: () => openUrl(LINKS.protocolDevDocs) }
      ]
    },
    {
      title: t_footer('titles.ecosystem'),
      content: [
        { content: t_footer('extensions'), onClick: () => openUrl(LINKS.ecosystem) },
        { content: t_footer('security'), onClick: () => openUrl(LINKS.audits) }
      ]
    },
    {
      title: t_footer('titles.community'),
      content: [
        {
          content: 'Twitter',
          onClick: () => openUrl(LINKS.twitter),
          icon: <SocialIcon platform='twitter' className='w-6 h-auto shrink-0' />
        },
        {
          content: 'Farcaster',
          onClick: () => openUrl(LINKS.farcaster),
          icon: <SocialIcon platform='farcaster' className='w-6 h-auto shrink-0' />
        },
        {
          content: 'Discord',
          onClick: () => setIsCaptchaModalOpen(true),
          icon: <SocialIcon platform='discord' className='w-6 h-auto shrink-0' />
        },
        {
          content: 'GitHub',
          onClick: () => openUrl(LINKS.github),
          icon: <SocialIcon platform='github' className='w-6 h-auto shrink-0' />
        },
        {
          content: 'Mirror',
          onClick: () => openUrl(LINKS.mirror),
          icon: <SocialIcon platform='mirror' className='w-6 h-auto shrink-0' />
        }
      ]
    },
    {
      title: t_footer('titles.settings'),
      content: [
        {
          content: t_settings('changeCurrency'),
          onClick: () => {
            setSettingsModalView('currency')
            setIsSettingsModalOpen(true)
          }
        },
        {
          content: t_settings('changeLanguage'),
          onClick: () => {
            setSettingsModalView('language')
            setIsSettingsModalOpen(true)
          }
        }
      ]
    }
  ]

  return (
    <FlowbiteFooter
      theme={{
        root: {
          base: 'w-full flex flex-col gap-20 items-center px-12 pt-12 pb-40 shadow z-40 md:px-16 md:pb-12'
        }
      }}
      className='bg-pt-purple-600'
    >
      <div className='w-full max-w-6xl flex justify-between gap-10 text-sm flex-col md:flex-row md:flex-wrap md:text-base'>
        {footerItems.map((item) => {
          return (
            <div
              key={`ft-${item.title.toLowerCase().replaceAll(' ', '-')}`}
              className={classNames('w-full md:w-24 grow', item.className)}
            >
              <FlowbiteFooter.Title
                theme={{ base: 'mb-2' }}
                title={item.title}
                className={classNames('text-pt-purple-300 font-bold', item.titleClassName)}
              />
              <FlowbiteFooter.LinkGroup theme={{ base: 'flex flex-col gap-3 text-pt-purple-100' }}>
                {item.content.map((content, i) => {
                  return (
                    <FooterItemContent
                      key={`ft-item-${item.title.toLowerCase().replaceAll(' ', '-')}-${i}`}
                      {...content}
                      className={item.itemClassName}
                    />
                  )
                })}
              </FlowbiteFooter.LinkGroup>
            </div>
          )
        })}
      </div>
      <div className='flex flex-col gap-1 items-center text-center text-sm text-pt-purple-100'>
        <button onClick={() => openUrl(LINKS.termsOfService)}>
          {t_footer('termsAndConditions')}
        </button>
        <button onClick={() => openUrl(LINKS.privacyPolicy)}>{t_footer('privacyPolicy')}</button>
      </div>
    </FlowbiteFooter>
  )
}

interface FooterItemContentProps {
  content: ReactNode
  href?: string
  icon?: JSX.Element
  onClick?: () => void
  disabled?: boolean
}

const FooterItemContent = (props: FooterItemContentProps & { className?: string }) => {
  const { content, href, icon, onClick, disabled, className } = props

  const baseClassName = 'flex items-center gap-2 whitespace-nowrap'

  if (disabled) {
    return (
      <span className={classNames(baseClassName, 'text-pt-purple-300', className)}>
        {icon}
        {content}
      </span>
    )
  }

  if (!!href) {
    return (
      <FlowbiteFooter.Link theme={{ base: '' }} href={href} className={classNames(className)}>
        <span className={classNames(baseClassName)}>
          {icon}
          {content}
        </span>
      </FlowbiteFooter.Link>
    )
  }

  return (
    <span
      className={classNames(
        baseClassName,
        { 'cursor-pointer hover:underline': onClick !== undefined },
        className
      )}
      onClick={onClick}
    >
      {icon}
      {content}
    </span>
  )
}
