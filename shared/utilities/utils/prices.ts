import { Address, isAddress } from 'viem'
import {
  TOKEN_PRICE_API_SUPPORTED_NETWORKS,
  TOKEN_PRICE_REDIRECTS,
  TOKEN_PRICES_API_URL
} from '../constants'
import { lower } from './addresses'

/**
 * Returns token prices in ETH from the CloudFlare API
 * @param chainId chain ID where the token addresses provided are from
 * @param tokenAddresses token addresses to query prices for
 * @returns
 */
export const getTokenPrices = async (
  chainId: number,
  tokenAddresses?: string[],
  options?: { requestHeaders?: Record<string, string> }
): Promise<{ [address: Address]: number }> => {
  if (process.env.NEXT_PUBLIC_USE_MOCK_TOKEN_PRICES) {
    return MOCK_PRICES
  }

  try {
    if (TOKEN_PRICE_API_SUPPORTED_NETWORKS.includes(chainId)) {
      const url = new URL(`${TOKEN_PRICES_API_URL}/${chainId}`)
      const tokenPrices: { [address: Address]: number } = {}

      if (!!tokenAddresses && tokenAddresses.length > 0) {
        url.searchParams.set('tokens', tokenAddresses.join(','))
      }

      const response = await fetch(
        url.toString(),
        !!options?.requestHeaders ? { headers: options.requestHeaders } : undefined
      )
      const rawTokenPrices: { [address: Address]: { date: string; price: number }[] } =
        await response.json()
      Object.keys(rawTokenPrices).forEach((address) => {
        const tokenPrice = rawTokenPrices[address as Address][0]?.price
        if (tokenPrice !== undefined) {
          tokenPrices[address as Address] = tokenPrice
        }
      })

      if (
        !!tokenAddresses &&
        tokenAddresses.length > 0 &&
        Object.keys(tokenPrices).length < tokenAddresses.length
      ) {
        const redirectedTokenPrices = await getRedirectedTokenPrices(chainId, tokenAddresses)
        Object.entries(redirectedTokenPrices).forEach(([address, price]) => {
          if (!tokenPrices[address as Address]) {
            tokenPrices[address as Address] = price
          }
        })
      }

      return tokenPrices
    } else if (!!tokenAddresses && tokenAddresses.length > 0) {
      return await getRedirectedTokenPrices(chainId, tokenAddresses)
    } else {
      return {}
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}

/**
 * Returns a token's historical prices in ETH from the CloudFlare API
 * @param chainId chain ID where the token addresses provided is from
 * @param tokenAddress token address to query historical prices for
 * @returns
 */
export const getHistoricalTokenPrices = async (
  chainId: number,
  tokenAddress: string,
  options?: { requestHeaders?: Record<string, string> }
): Promise<{ [address: Address]: { date: string; price: number }[] }> => {
  if (!isAddress(tokenAddress)) return {}

  try {
    if (TOKEN_PRICE_API_SUPPORTED_NETWORKS.includes(chainId)) {
      const url = new URL(`${TOKEN_PRICES_API_URL}/${chainId}/${tokenAddress}`)

      const response = await fetch(
        url.toString(),
        !!options?.requestHeaders ? { headers: options.requestHeaders } : undefined
      )
      const tokenPrices: { [address: Address]: { date: string; price: number }[] } =
        await response.json()

      const priceEntries = Object.values(tokenPrices)[0]
      if (!!priceEntries?.length) {
        return tokenPrices
      } else {
        return await getRedirectedHistoricalTokenPrices(chainId, tokenAddress)
      }
    } else {
      const lowercaseTokenAddress = lower(tokenAddress)
      const mostRecentTokenPrice = (await getTokenPrices(chainId, [tokenAddress]))[
        lowercaseTokenAddress
      ]
      const dateNow = new Date().toISOString().split('T')[0]

      return { [lowercaseTokenAddress]: [{ date: dateNow, price: mostRecentTokenPrice }] }
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}

/**
 * Returns redirected token prices for tokens without accurate pricing data on their original network
 * @param chainId chain ID where the token addresses provided are from
 * @param tokenAddresses token addresses to query redirected prices for (if necessary)
 * @returns
 */
const getRedirectedTokenPrices = async (chainId: number, tokenAddresses: string[]) => {
  const redirectedTokenPrices: { [address: string]: number } = {}
  const redirectedTokens: { [chainId: number]: { [address: string]: string } } = {}

  tokenAddresses.forEach((_address) => {
    const address = lower(_address)
    const redirect = TOKEN_PRICE_REDIRECTS[chainId]?.[address]

    if (!!redirect) {
      if (redirectedTokens[redirect.chainId] === undefined) {
        redirectedTokens[redirect.chainId] = {}
      }
      redirectedTokens[redirect.chainId][redirect.address] = address
    }
  })

  const newTokenPrices = await Promise.all(
    Object.keys(redirectedTokens).map(async (key) => {
      const newChainId = parseInt(key)
      const newTokenAddresses = Object.keys(redirectedTokens[newChainId])
      return {
        chainId: newChainId,
        tokenPrices: await getTokenPrices(newChainId, newTokenAddresses)
      }
    })
  )

  newTokenPrices.forEach((chainNewTokenPrices) => {
    Object.entries(chainNewTokenPrices.tokenPrices).forEach(([address, price]) => {
      const originalTokenAddress = redirectedTokens[chainNewTokenPrices.chainId]?.[address]
      redirectedTokenPrices[originalTokenAddress] = price
    })
  })

  return redirectedTokenPrices
}

/**
 * Returns redirected historical token prices for a token without accurate pricing data on their original network
 * @param chainId chain ID where the token addresses provided is from
 * @param tokenAddress token address to query redirected historical prices for (if necessary)
 * @returns
 */
const getRedirectedHistoricalTokenPrices = async (chainId: number, tokenAddress: string) => {
  const redirect = TOKEN_PRICE_REDIRECTS[chainId]?.[lower(tokenAddress)]

  if (!!redirect) {
    const redirectedHistoricalTokenPrices: {
      [address: Address]: { date: string; price: number }[]
    } = {}

    const newHistoricalTokenPrices = await getHistoricalTokenPrices(
      redirect.chainId,
      redirect.address
    )

    const priceEntries = Object.values(newHistoricalTokenPrices)[0]
    if (!!priceEntries?.length) {
      redirectedHistoricalTokenPrices[tokenAddress as Address] = priceEntries
    }

    return redirectedHistoricalTokenPrices
  } else {
    return {}
  }
}

const MOCK_PRICES: { [address: Address]: number } = {
  '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e': 0.000067343812211289,
  '0x4200000000000000000000000000000000000006': 1,
  '0xd652c5425aea2afd5fb142e120fecf79e18fafc3': 0.000066157312895307,
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631': 0.000324938993480508,
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 0.000229184163552197,
  '0xdbfefd2e8460a6ee4955a68582f85708baea60a3': 0.9219067447599653,
  '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42': 0.000268568329774813,
  '0x0b15b1d434f86ecaa83d14398c8db6d162f3921e': 0.0005795478738953258,
  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': 1.1013005179749593,
  '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452': 1.2076789706953455,
  '0x89d0f320ac73dd7d9513ffc5bc58d1161452a657': 0.007703421981214934,
  '0x0000206329b97db379d5e1bf586bbdb969c63274': 0.000396069865217225,
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 0.000229079936161709,
  '0xa88594d404727625a9437c3f886c7643872296ae': 0.000006569610628135,
  '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe': 0.000001055980103454,
  '0x32e0f9d26d1e33625742a52620cc76c1130efde6': 1.502015711e-9,
  '0x6b175474e89094c44da98b954eedeac495271d0f': 0.000230433368337844
}
