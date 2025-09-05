export const privyConfig = {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clucr424r0dhh12tb3govpc0f',
    config: {
        appearance: {
            theme: 'light' as 'light',
            accentColor: '#f59e0b' as `#${string}`,
        },
        // Only wallet login methods
        loginMethods: ['wallet'] as ('wallet')[],
        // Configure wallet display order and visibility
        externalWallets: {
            metamask: {
                enabled: true,
            },
            rabby: {
                enabled: true,
            },
            phantom: {
                enabled: true,
            },
            walletConnect: {
                enabled: true,
            },
        },
        // Re-enable embedded wallets now that we have HTTPS
        embeddedWallets: {
            createOnLogin: 'users-without-wallets' as 'users-without-wallets',
        },
        // Configure wallet display preferences
        walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
        },
    },
};
