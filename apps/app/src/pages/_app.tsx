import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import '@coinbase/onchainkit/styles.css'
import { IncomingMessage } from 'http'
import type { Metadata } from 'next'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { base } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import { AppContainer } from '@components/AppContainer'
import '../styles/globals.css'
import { wagmiConfig } from '../utils'

export interface CustomAppProps {
  serverProps: {
    params: { [key: string]: string }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL as string

  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: 'launch_frame',
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR
          }
        }
      })
    }
  }
}

export default function MyApp(props: AppProps & CustomAppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <MiniKitProvider
        projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_ID}
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        notificationProxyUrl='/api/notification'
        chain={base}
        rpcUrl={process.env.NEXT_PUBLIC_BASE_RPC_URL}
      >
        <AppContainer {...props} />
      </MiniKitProvider>
    </WagmiProvider>
  )
}

MyApp.getInitialProps = async (appCtx: AppContext): Promise<AppInitialProps & CustomAppProps> => {
  const initialProps = await App.getInitialProps(appCtx)

  const internalReqKey = Symbol.for('NextInternalRequestMeta')
  interface NextIncomingMessage extends IncomingMessage {
    [internalReqKey]: {
      match: { params: { [key: string]: string } }
    }
  }
  const req = appCtx.ctx.req as NextIncomingMessage | undefined
  const { match } = req?.[internalReqKey] ?? {}
  const serverProps = { params: match?.params ?? {} }

  return { ...initialProps, serverProps }
}
