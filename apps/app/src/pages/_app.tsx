import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IncomingMessage } from 'http'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { createConfig, http, WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { AppContainer } from '@components/AppContainer'
import '../styles/globals.css'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)
  },
  connectors: [farcasterFrame()]
})

export interface CustomAppProps {
  serverProps: {
    params: { [key: string]: string }
  }
}

export default function MyApp(props: AppProps & CustomAppProps) {
  return (
    <WagmiProvider config={config} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <AppContainer {...props} />
      </QueryClientProvider>
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
