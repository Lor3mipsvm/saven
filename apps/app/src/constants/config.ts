import { CreateWalletFn } from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { injectedWallet, metaMaskWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets'
import { VaultList } from '@shared/types'
import {
  DOLPHIN_ADDRESS,
  NETWORK,
  POOL_TOKEN_ADDRESSES,
  USDC_TOKEN_ADDRESSES
} from '@shared/utilities'
import defaultVaultList from '@vaultLists/default'
import { Address, parseEther } from 'viem'
import { gnosisChiado, worldchain } from 'viem/chains'

/**
 * Supported networks
 */
export const SUPPORTED_NETWORKS = {
  mainnets: [NETWORK.world],
  testnets: [NETWORK.gnosis_chiado]
} as const

/**
 * Wagmi networks
 */
export const WAGMI_CHAINS = {
  [NETWORK.world]: worldchain,
  [NETWORK.gnosis_chiado]: gnosisChiado
} as const

/**
 * Wallets
 */
export const WALLETS: { [wallet: string]: CreateWalletFn } = {
  metamask: metaMaskWallet,
  rainbow: rainbowWallet,
  injected: injectedWallet
}

/**
 * RPCs
 */
export const RPC_URLS = {
  [NETWORK.world]: process.env.NEXT_PUBLIC_WORLD_RPC_URL,
  [NETWORK.gnosis_chiado]: process.env.NEXT_PUBLIC_GNOSIS_CHIADO_RPC_URL
} as const

/**
 * EIP 5792 Paymaster URLs
 */
export const PAYMASTER_URLS: { [chainId: number]: string | undefined } = {
  [NETWORK.world]: process.env.NEXT_PUBLIC_WORLD_PAYMASTER_URL
}

/**
 * Default vault lists
 */
export const DEFAULT_VAULT_LISTS = {
  default: defaultVaultList
} as const satisfies { [vaultListId: string]: VaultList }

/**
 * POOL staking prize vaults
 */
export const POOL_STAKING_VAULTS: { [chainId: number]: Lowercase<Address> } = {
  [NETWORK.world]: '0x0045cc66ecf34da9d8d89ad5b36cb82061c0907c',
  [NETWORK.gnosis_chiado]: '0x7c44c6dd009a36ef393dba89d9d1e1528648cb51'
}

/**
 * Event queries' start blocks
 */
export const QUERY_START_BLOCK = {
  [NETWORK.world]: 11_542_400n,
  [NETWORK.gnosis_chiado]: 11_555_000n
} as const satisfies { [chainId: number]: bigint }

/**
 * TWAB rewards settings
 */
export const TWAB_REWARDS_SETTINGS: {
  [chainId: number]: { tokenAddresses: Address[]; fromBlock: bigint }
} = {
  [NETWORK.world]: {
    tokenAddresses: [
      '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1', // USDC
      '0x4200000000000000000000000000000000000006', // WETH
      '0x2cFc85d8E48F8EAB294be644d9E25C3030863003', // WLD
      '0x7077C71B4AF70737a08287E279B717Dcf64fdC57' // POOL
    ],
    fromBlock: QUERY_START_BLOCK[NETWORK.world]
  },
  [NETWORK.gnosis_chiado]: {
    tokenAddresses: [
      USDC_TOKEN_ADDRESSES[NETWORK.gnosis_chiado],
      POOL_TOKEN_ADDRESSES[NETWORK.gnosis_chiado]
    ],
    fromBlock: QUERY_START_BLOCK[NETWORK.gnosis_chiado]
  }
}

/**
 * Custom overwrite for wallet addresses
 */
export const WALLET_NAMES: { [address: Lowercase<Address>]: { name: string; chainId?: number } } = {
  '0xdd315e449bead6e65b30920a3050550292eac3d4': { name: 'GP Booster', chainId: NETWORK.world }
}

/**
 * Zap token priorities
 */
export const ZAP_PRIORITIES: {
  [chainId: number]: { [vaultAddress: Lowercase<Address>]: Address }
} = {}

/**
 * Zap token options
 */
export const ZAP_TOKEN_OPTIONS: { [chainId: number]: Address[] } = {
  [NETWORK.world]: [
    DOLPHIN_ADDRESS, // ETH
    '0x4200000000000000000000000000000000000006', // WETH
    '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1', // USDC
    '0x2cFc85d8E48F8EAB294be644d9E25C3030863003', // WLD
    '0x7077C71B4AF70737a08287E279B717Dcf64fdC57' // POOL
  ]
}

/**
 * Amount of native assets to suggest not spending (for gas purposes)
 */
export const NATIVE_ASSET_IGNORE_AMOUNT: { [chainId: number]: bigint } = {
  [NETWORK.world]: parseEther('0.002')
}

/**
 * Wallet stats API
 */
export const WALLET_STATS_API_URL = 'https://wallet-stats.api.cabana.fi'
