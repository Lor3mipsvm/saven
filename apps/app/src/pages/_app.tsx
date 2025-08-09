import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IncomingMessage } from 'http'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
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
  return (
    <MiniKitProvider
      projectId={process.env.NEXT_PUBLIC_CB_PROJECT_ID}
      apiKey={process.env.NEXT_PUBLIC_CB_PUBLIC_API_KEY}
      chain={base}
    >
      <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
        <QueryClientProvider client={queryClient}>
          <AppContainer {...props} />
        </QueryClientProvider>
      </WagmiProvider>
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
