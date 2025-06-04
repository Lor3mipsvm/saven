import { useSelectedLanguage } from '@shared/generic-react-hooks'
import { Flowbite, Toaster } from '@shared/ui'
import { MiniKit } from '@worldcoin/minikit-js'
import { NextIntlClientProvider } from 'next-intl'
import { AppProps } from 'next/app'
import { ReactNode, useEffect, useState } from 'react'
import { useConnect } from 'wagmi'
import { CustomAppProps } from '@pages/_app'
import { AccountFrame } from './Frames/AccountFrame'
import { DefaultFrame } from './Frames/DefaultFrame'
import { VaultFrame } from './Frames/VaultFrame'

export const AppContainer = (props: AppProps & CustomAppProps) => {
  const { Component, pageProps, serverProps, router } = props
  const { pathname, query, asPath, locale } = router

  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_VITE_APP_ID

    if (isReady) {
      if (!MiniKit.isInstalled()) {
        MiniKit.install(appId)
      }
      if (!MiniKit.isInstalled()) {
        console.error('MiniKit is not installed')
      }
    }
  }, [isReady])

  useEffect(() => {
    const initEruda = async () => {
      let dev = process.env.NODE_ENV === 'development'

      if (!dev && typeof window !== 'undefined') {
        // @ts-ignore
        dev = window?.location.href.match(/staging/)?.length > 0
      }

      if (!dev) {
        return
      }
      const eruda = (await import('eruda')).default
      eruda.init()
    }

    initEruda()
  })

  useSelectedLanguage({
    onLanguageChange: (newLanguage) => {
      router.push({ pathname, query }, asPath, { locale: newLanguage })

      // Tiny delay to avoid flickering on differing language selection to locale default
      setTimeout(() => {
        setIsReady(true)
      }, 100)
    }
  })

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  const { connect } = useConnect()

  const pageFrames: { [href: string]: ReactNode } = {
    account: <AccountFrame user={serverProps.params['user']} />,
    vault: (
      <VaultFrame
        chainId={serverProps.params['chainId']}
        vaultAddress={serverProps.params['vaultAddress']}
      />
    )
  }

  const pageFrame = pageFrames[pathname.split('/')[1]]

  return (
    <>
      {pageFrame ?? <DefaultFrame />}
      <Flowbite>
        <Toaster expand={false} />
        <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
          <div id='modal-root' />
          {isReady && <Component {...pageProps} />}
        </NextIntlClientProvider>
      </Flowbite>
    </>
  )
}
