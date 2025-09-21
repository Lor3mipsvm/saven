import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { IncomingMessage } from 'http'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { base } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppContainer } from '@components/AppContainer'
import '../styles/globals.css'
import { wagmiConfig } from '../utils'

export interface CustomAppProps {
  serverProps: {
    params: { [key: string]: string }
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export default function MyApp(props: AppProps & CustomAppProps) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID

  // Check for valid Dynamic environment ID
  if (!environmentId || environmentId === 'your_dynamic_environment_id_here' || environmentId === 'development') {
    console.log('DynamicProviderWrapper - Using fallback (no Dynamic)')
    // Return just WagmiProvider and QueryClientProvider without Dynamic
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppContainer {...props} />
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContextProvider
        settings={{
          environmentId: environmentId,
          walletConnectors: [EthereumWalletConnectors],
          initialAuthenticationMode: 'connect-only',
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          appearance: {
            theme: 'dark',
            accentColor: '#f59e0b', // Amber-500
            borderRadius: '0.75rem', // Rounded-xl for modern look
            colors: {
              primary: '#f59e0b', // Amber-500 - main brand color
              secondary: '#fbbf24', // Amber-400 - lighter accent
              accent: '#d97706', // Amber-600 - darker accent
              background: '#0f172a', // Slate-900 - dark background
              foreground: '#f1f5f9', // Slate-100 - light text
              muted: '#1e293b', // Slate-800 - muted dark
              border: '#334155', // Slate-700 - subtle borders
              card: '#1e293b', // Slate-800 - card backgrounds
              cardForeground: '#f1f5f9', // Slate-100 - card text
              popover: '#0f172a', // Slate-900 - popover background
              popoverForeground: '#f1f5f9', // Slate-100 - popover text
              destructive: '#ef4444', // Red-500 - error states
              destructiveForeground: '#f1f5f9', // Slate-100 - error text
              success: '#10b981', // Emerald-500 - success states
              successForeground: '#f1f5f9', // Slate-100 - success text
            },
          },
          eventsCallbacks: {
            onAuthSuccess: (args) => {
              console.log('Dynamic auth success:', args)
            },
            onAuthFailure: (args) => {
              console.log('Dynamic auth failure:', args)
            },
          },
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          <AppContainer {...props} />
        </WagmiProvider>
      </DynamicContextProvider>
    </QueryClientProvider>
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
