'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmi-config'
import { useState } from 'react'

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
    // Create a stable QueryClient instance
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                gcTime: 10 * 60 * 1000, // 10 minutes
            },
        },
    }))

    // For now, just provide QueryClient for Cabana hooks
    // WagmiProvider will be added with Dynamic in Phase 2
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
