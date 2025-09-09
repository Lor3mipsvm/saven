'use client'

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { dynamicConfig } from '@/lib/dynamic-config'
import { wagmiConfig } from '@/lib/wagmi-config'
import { useState } from 'react'

export function DynamicProviderWrapper({ children }: { children: React.ReactNode }) {
    // Create a stable QueryClient instance
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                gcTime: 10 * 60 * 1000, // 10 minutes
            },
        },
    }))

    // Check if Dynamic environment ID is configured
    const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID

    console.log('DynamicProviderWrapper - Environment ID:', environmentId)
    console.log('DynamicProviderWrapper - Dynamic config:', dynamicConfig)

    // Check for valid Dynamic environment ID
    if (!environmentId || environmentId === 'your_dynamic_environment_id_here' || environmentId === 'development') {
        console.log('DynamicProviderWrapper - Using fallback (no Dynamic)')
        // Return just WagmiProvider and QueryClientProvider without Dynamic
        const WagmiProviderComponent = WagmiProvider as any
        return (
            <WagmiProviderComponent config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </WagmiProviderComponent>
        )
    }

    // Double-check that we have a valid environment ID before rendering Dynamic
    if (!dynamicConfig.environmentId || dynamicConfig.environmentId === 'development') {
        console.log('DynamicProviderWrapper - Using fallback (invalid dynamicConfig.environmentId)')
        const WagmiProviderComponent = WagmiProvider as any
        return (
            <WagmiProviderComponent config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </WagmiProviderComponent>
        )
    }

    // Use type assertions to work around TypeScript issues
    const DynamicProvider = DynamicContextProvider as any
    const WagmiProviderComponent = WagmiProvider as any


    // Add error boundary for Dynamic initialization
    const handleDynamicError = (error: any) => {
        // If Dynamic fails to initialize, we could fall back to Wagmi only
        // But for now, just log the error
    }

    console.log('DynamicProviderWrapper - Using Dynamic provider')

    return (
        <DynamicProvider
            settings={{
                environmentId: dynamicConfig.environmentId,
                walletConnectors: dynamicConfig.walletConnectors,
                ...dynamicConfig.settings,
                eventsCallbacks: {
                    ...dynamicConfig.settings.eventsCallbacks,
                    onAuthFailure: (args: any) => {
                        handleDynamicError(args)
                    },
                }
            }}
        >
            <WagmiProviderComponent config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </WagmiProviderComponent>
        </DynamicProvider>
    )
}