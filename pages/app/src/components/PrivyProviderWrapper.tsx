'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfig } from '@/lib/privy-config';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
    // Check if we have a valid App ID
    const hasValidAppId = privyConfig.appId && privyConfig.appId !== 'clx1234567890abcdef';

    if (!hasValidAppId) {
        // Fallback: render children without PrivyProvider for development
        console.warn('Privy App ID not configured. Wallet features will be disabled.');
        return <>{children}</>;
    }

    return (
        <PrivyProvider
            appId={privyConfig.appId}
            config={privyConfig.config}
        >
            {children}
        </PrivyProvider>
    );
}
