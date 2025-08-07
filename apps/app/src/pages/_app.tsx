import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IncomingMessage } from 'http'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { type Config, createConfig, http, WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { AppContainer } from '@components/AppContainer'
import { SUPPORTED_NETWORKS } from '@constants/config'
import '../styles/globals.css'

// React Query Client:
const queryClient = new QueryClient()

const networks = [...SUPPORTED_NETWORKS.mainnets, ...SUPPORTED_NETWORKS.testnets]
// const wagmiConfig = createCustomWagmiConfig(networks)

export const config: Config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http()
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
