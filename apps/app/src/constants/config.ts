import { VaultList } from '@shared/types'
import {
  DOLPHIN_ADDRESS,
  NETWORK,
  POOL_TOKEN_ADDRESSES,
  USDC_TOKEN_ADDRESSES
} from '@shared/utilities'
import defaultVaultList from '@vaultLists/default'
import { Address, parseEther } from 'viem'
import { base, gnosisChiado } from 'viem/chains'

/**
 * Supported networks
 */
export const SUPPORTED_NETWORKS = {
  mainnets: [NETWORK.base],
  testnets: [NETWORK.gnosis_chiado]
} as const

/**
 * Wagmi networks
 */
export const WAGMI_CHAINS = {
  [NETWORK.base]: base,
  [NETWORK.gnosis_chiado]: gnosisChiado
} as const

/**
 * RPCs
 */
export const RPC_URLS = {
  [NETWORK.base]: process.env.NEXT_PUBLIC_BASE_RPC_URL,
  [NETWORK.gnosis_chiado]: process.env.NEXT_PUBLIC_GNOSIS_CHIADO_RPC_URL
} as const

/**
 * EIP 5792 Paymaster URLs
 */
export const PAYMASTER_URLS: { [chainId: number]: string | undefined } = {
  [NETWORK.base]: process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL
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
  [NETWORK.base]: '0x6b5a5c55e9dd4bb502ce25bbfbaa49b69cf7e4dd',
  [NETWORK.gnosis_chiado]: '0x7c44c6dd009a36ef393dba89d9d1e1528648cb51'
}

/**
 * Event queries' start blocks
 */
export const QUERY_START_BLOCK = {
  [NETWORK.base]: 14_506_800n,
  [NETWORK.gnosis_chiado]: 11_555_000n
} as const satisfies { [chainId: number]: bigint }

/**
 * TWAB rewards settings
 */
export const TWAB_REWARDS_SETTINGS: {
  [chainId: number]: { tokenAddresses: Address[]; fromBlock: bigint }
} = {
  [NETWORK.base]: {
    tokenAddresses: [
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
      '0x4200000000000000000000000000000000000006', // WETH
      '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', // DAI
      '0xd652C5425aea2Afd5fb142e120FeCf79e18fafc3', // POOL
      '0xA88594D404727625A9437C3f886C7643872296AE', // WELL
      '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe', // HIGHER
      '0x32E0f9d26D1e33625742A52620cC76C1130efde6' // BASED
    ],
    fromBlock: QUERY_START_BLOCK[NETWORK.base]
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
  '0x327b2ea9668a552fe5dec8e3c6e47e540a0a58c6': { name: 'GP Booster', chainId: NETWORK.base }
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
  [NETWORK.base]: [
    DOLPHIN_ADDRESS, // ETH
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    '0x940181a94A35A4569E4529A3CDfB74e38FD98631', // AERO
    '0xd652C5425aea2Afd5fb142e120FeCf79e18fafc3', // POOL
    '0x4200000000000000000000000000000000000006', // WETH
    '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452', // wstETH
    '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // cbETH
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
    '0x368181499736d0c0CC614DBB145E2EC1AC86b8c6', // LUSD
    '0x0000206329b97DB379d5E1Bf586BbDB969C63274', // USDA
    '0xA88594D404727625A9437C3f886C7643872296AE' // WELL
  ]
}

/**
 * Amount of native assets to suggest not spending (for gas purposes)
 */
export const NATIVE_ASSET_IGNORE_AMOUNT: { [chainId: number]: bigint } = {
  [NETWORK.base]: parseEther('0.002')
}

/**
 * Wallet stats API
 */
export const WALLET_STATS_API_URL = 'https://wallet-stats.api.cabana.fi'
