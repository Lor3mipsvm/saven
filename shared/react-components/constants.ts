import {
  DOLPHIN_ADDRESS,
  LINKS,
  NETWORK,
  POOL_TOKEN_ADDRESSES,
  USDC_TOKEN_ADDRESSES
} from '@shared/utilities'

/**
 * Token Logo URLs
 */
const tokenLogoUrls = {
  eth: `${LINKS.app}/icons/ether.svg`,
  pool: 'https://assets.coingecko.com/coins/images/14003/standard/PoolTogether.png',
  usdc: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  dai: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png',
  gusd: 'https://assets.coingecko.com/coins/images/5992/standard/gemini-dollar-gusd.png',
  weth: 'https://assets.coingecko.com/coins/images/2518/standard/weth.png',
  wbtc: 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png',
  lusd: 'https://assets.coingecko.com/coins/images/14666/standard/Group_3.png',
  op: 'https://optimistic.etherscan.io/token/images/optimism_32.png',
  steth: 'https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png',
  usdt: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
  usda: 'https://raw.githubusercontent.com/AngleProtocol/angle-token-list/main/src/assets/tokens/stUSD.svg',
  eura: 'https://raw.githubusercontent.com/AngleProtocol/angle-token-list/main/src/assets/tokens/stEUR.svg',
  crash: 'https://assets.coingecko.com/coins/images/37152/standard/apCdaaX9_400x400.jpg',
  degen: 'https://assets.coingecko.com/coins/images/34515/standard/android-chrome-512x512.png',
  dude: 'https://assets.coingecko.com/coins/images/36860/standard/dudelogo.png',
  higher: 'https://assets.coingecko.com/coins/images/36084/standard/200x200logo.png',
  well: 'https://assets.coingecko.com/coins/images/26133/standard/WELL.png',
  bifi: 'https://assets.coingecko.com/coins/images/12704/standard/bifi.png',
  mooBIFI:
    'https://assets.coingecko.com/coins/images/32597/standard/319381e63428d3c2ab6e035d5f3abd76.png',
  reth: 'https://assets.coingecko.com/coins/images/20764/standard/reth.png',
  snx: 'https://assets.coingecko.com/coins/images/3406/standard/SNX.png',
  crv: 'https://assets.coingecko.com/coins/images/12124/standard/Curve.png',
  based: 'https://basescan.org/token/images/basedtoken_32.png',
  uni: 'https://assets.coingecko.com/coins/images/12504/standard/uniswap-logo.png',
  ldo: 'https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png',
  aero: 'https://assets.coingecko.com/coins/images/31745/standard/token.png',
  cbeth: 'https://assets.coingecko.com/coins/images/27008/standard/cbeth.png',
  xdai: 'https://gnosisscan.io/token/images/wrappedxdai_32.png',
  usds: 'https://assets.coingecko.com/coins/images/39926/standard/usds.webp',
  superOETH: 'https://assets.coingecko.com/coins/images/39828/standard/Super_OETH.png',
  wld: 'https://assets.coingecko.com/coins/images/31069/standard/worldcoin.jpeg'
} as const

/**
 * Token Logo Overrides
 */
export const TOKEN_LOGO_OVERRIDES: Record<NETWORK, { [address: Lowercase<string>]: string }> = {
  [NETWORK.mainnet]: {
    [DOLPHIN_ADDRESS]: tokenLogoUrls.eth,
    [POOL_TOKEN_ADDRESSES[NETWORK.mainnet].toLowerCase()]: tokenLogoUrls.pool,
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': tokenLogoUrls.usdc,
    '0x6b175474e89094c44da98b954eedeac495271d0f': tokenLogoUrls.dai,
    '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd': tokenLogoUrls.gusd,
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': tokenLogoUrls.weth,
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': tokenLogoUrls.wbtc,
    '0x5f98805a4e8be255a32880fdec7f6728c6568ba0': tokenLogoUrls.lusd,
    '0x0000206329b97db379d5e1bf586bbdb969c63274': tokenLogoUrls.usda,
    '0x1a7e4e63778b4f12a199c062f3efdd288afcbce8': tokenLogoUrls.eura,
    '0xb1f1ee126e9c96231cc3d3fad7c08b4cf873b1f1': tokenLogoUrls.bifi,
    '0xae78736cd615f374d3085123a210448e74fc6393': tokenLogoUrls.reth,
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': tokenLogoUrls.snx,
    '0xd533a949740bb3306d119cc777fa900ba034cd52': tokenLogoUrls.crv,
    '0xdac17f958d2ee523a2206206994597c13d831ec7': tokenLogoUrls.usdt,
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': tokenLogoUrls.uni,
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32': tokenLogoUrls.ldo,
    '0xdc035d45d973e3ec169d2276ddab16f1e407384f': tokenLogoUrls.usds,
    '0x163f8c2467924be0ae7b5347228cabf260318753': tokenLogoUrls.wld
  },
  [NETWORK.gnosis_chiado]: {
    [DOLPHIN_ADDRESS]: tokenLogoUrls.xdai,
    [POOL_TOKEN_ADDRESSES[NETWORK.gnosis_chiado].toLowerCase()]: tokenLogoUrls.pool,
    [USDC_TOKEN_ADDRESSES[NETWORK.gnosis_chiado]]: tokenLogoUrls.usdc,
    '0xb2d0d7ad1d4b2915390dc7053b9421f735a723e7': tokenLogoUrls.xdai,
    '0xbe9a62939f82e12f4a48912078a4420f1a5fc2e0': tokenLogoUrls.gusd,
    '0x6b629bb304017d3d985d140599d8e6fc9942b9a7': tokenLogoUrls.weth,
    '0x3e9c64afc24c551cc8e11f52fedecdacf7362559': tokenLogoUrls.wbtc
  },
  [NETWORK.world]: {
    [DOLPHIN_ADDRESS]: tokenLogoUrls.eth,
    [POOL_TOKEN_ADDRESSES[NETWORK.world].toLowerCase()]: tokenLogoUrls.pool,
    '0x4200000000000000000000000000000000000006': tokenLogoUrls.weth,
    '0x79a02482a880bce3f13e09da970dc34db4cd24d1': tokenLogoUrls.usdc,
    '0x2cfc85d8e48f8eab294be644d9e25c3030863003': tokenLogoUrls.wld
  }
}

/**
 * TX Gas Amount Estimates
 */
export const TX_GAS_ESTIMATES = {
  approve: 50_000n,
  deposit: 400_000n,
  depositWithPermit: 450_000n,
  depositWithZap: 1_000_000n,
  withdraw: 350_000n,
  withdrawWithZap: 900_000n,
  delegate: 120_000n
} as const
