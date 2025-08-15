import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import '@coinbase/onchainkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IncomingMessage } from 'http'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { type ReactNode, useState } from 'react'
import { base } from 'viem/chains'
import { type State, WagmiProvider } from 'wagmi'
// import { base } from 'wagmi/chains'
import { AppContainer } from '@components/AppContainer'
import '../styles/globals.css'
import { wagmiConfig } from '../utils'

const queryClient = new QueryClient()

export interface CustomAppProps {
  serverProps: {
    params: { [key: string]: string }
  }
}

export default function MyApp(props: AppProps & CustomAppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <MiniKitProvider
      projectId={process.env.NEXT_PUBLIC_CB_PROJECT_ID}
      apiKey={process.env.NEXT_PUBLIC_CB_PUBLIC_API_KEY}
      notificationProxyUrl='/api/notification'
      chain={base}
      rpcUrl={process.env.NEXT_PUBLIC_BASE_RPC_URL}
    >
      <QueryClientProvider client={queryClient}>
        <AppContainer {...props} />
      </QueryClientProvider>
    </MiniKitProvider>
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
