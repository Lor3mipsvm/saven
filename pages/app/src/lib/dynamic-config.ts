import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { DynamicContextProvider, FilterWallets } from '@dynamic-labs/sdk-react-core'

// Only export config if we have a valid environment ID
const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID

if (!environmentId) {
    console.warn('NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is not set. Wallet connection will not work.')
}

// EthereumWalletConnectors needs to be wrapped in an array for walletConnectors prop
const walletConnectors = [EthereumWalletConnectors]


export const dynamicConfig = {
    environmentId: environmentId,
    walletConnectors: walletConnectors,
    settings: {
        // Set to connect-only mode (no signing required)
        initialAuthenticationMode: 'connect-only',

        // Enable embedded wallets
        embeddedWallets: {
            createOnLogin: 'users-without-wallets',
        },

        // Terms of Service and Privacy Policy URLs
        termsOfServiceUrl: 'https://saven.fi/terms-of-service',
        privacyPolicyUrl: 'https://saven.fi/privacy-policy',

        // Configure wallet list with tabs - Popular and More
        overrides: {
            views: [
                {
                    type: "wallet-list",
                    tabs: {
                        items: [
                            {
                                label: { text: "Popular" },
                                walletsFilter: (wallets) => wallets.filter(wallet =>
                                    ['metamask', 'rabby', 'phantom', 'phantomevm', 'phantomsol', 'walletconnect'].includes(wallet.key)
                                ),
                                // No recommendedWallets = no tags/pills displayed
                            },
                            {
                                label: { text: "More" },
                                // No filter means all wallets will be shown with search functionality
                            },
                        ],
                    },
                },
            ],
        },

        // Styling to match Saven brand (dark theme with amber accents)
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

        // Custom CSS overrides for modal outline and background
        cssOverrides: `
            /* Modal outline styling */
            [data-testid="dynamic-modal-shadow"] {
                outline: 3px solid rgba(245, 158, 11, 0.6) !important;
                outline-offset: 3px !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(245, 158, 11, 0.3) !important;
            }
            
            /* Modal content container */
            [data-testid="dynamic-modal-shadow"] > div:first-child {
                outline: 2px solid #f59e0b !important;
                outline-offset: 1px !important;
                border-radius: 0.75rem !important;
                background: #000000 !important;
                border: 1px solid #1e293b !important;
            }
            
            /* Modal background */
            [data-testid="dynamic-modal-shadow"] {
                background: #000000 !important;
            }
            
            /* Alternative targeting */
            [role="dialog"] {
                outline: 2px solid #f59e0b !important;
                outline-offset: 2px !important;
                background: #000000 !important;
            }
        `,

        // Events callbacks
        eventsCallbacks: {
            onAuthSuccess: (args: any) => { },
            onAuthFailure: (args: any) => { },
        },
    },
}
