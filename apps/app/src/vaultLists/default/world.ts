import { VaultList } from '@shared/types'
import { NETWORK } from '@shared/utilities'

export const worldVaults: VaultList['tokens'] = [
  {
    chainId: NETWORK.world,
    address: '0x0045cC66eCf34da9D8D89aD5b36cB82061c0907C',
    name: 'Prize POOL',
    decimals: 18,
    symbol: 'przPOOL',
    logoURI: `https://cabana-world-app-env-staging-g9-software-inc.vercel.app/icons/przPOOL.svg`,
    extensions: {
      underlyingAsset: {
        address: '0x7077C71B4AF70737a08287E279B717Dcf64fdC57',
        symbol: 'POOL',
        name: 'PoolTogether'
      },
      yieldSource: {
        name: 'PoolTogether'
      }
    }
  },
  {
    chainId: NETWORK.world,
    address: '0x8ad5959c9245b64173d4c0c3cd3ff66dac3cab0e',
    name: 'Prize WLD',
    decimals: 18,
    symbol: 'przWLD',
    logoURI: `https://cabana-world-app-env-staging-g9-software-inc.vercel.app/icons/przWLD.svg`,
    tags: ['deprecated'],
    extensions: {
      underlyingAsset: {
        address: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003',
        symbol: 'WLD',
        name: 'World'
      },
      yieldSource: {
        name: 'PoolTogether'
      }
    }
  }
]
