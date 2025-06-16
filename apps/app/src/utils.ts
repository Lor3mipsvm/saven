import { formatNumberForDisplay, NETWORK } from '@shared/utilities'
import { MiniKit } from '@worldcoin/minikit-js'
import deepmerge from 'deepmerge'
import { Address, Chain, formatUnits, http, Transport } from 'viem'
import { createConfig, fallback } from 'wagmi'
import { RPC_URLS, WAGMI_CHAINS } from '@constants/config'

/**
 * Returns a Wagmi config with the given networks and RPCs
 * @param networks the networks to support throughout the app
 * @param options optional settings
 * @returns
 */
export const createCustomWagmiConfig = (networks: NETWORK[]) => {
  const supportedNetworks = Object.values(WAGMI_CHAINS).filter(
    (chain) => networks.includes(chain.id) && !!RPC_URLS[chain.id]
  ) as any as [Chain, ...Chain[]]

  return createConfig({
    chains: supportedNetworks,
    // connectors: options?.connectors ?? getWalletConnectors(),
    transports: getNetworkTransports(supportedNetworks.map((network) => network.id)),
    batch: { multicall: { batchSize: 1_024 * 1_024 } },
    ssr: true
  })
}

/**
 * Returns network transports for Wagmi
 * @param networks the networks to get transports for
 * @param options optional settings
 * @returns
 */
const getNetworkTransports = (networks: (keyof typeof RPC_URLS)[]) => {
  const transports: { [chainId: number]: Transport } = {}

  networks.forEach((network) => {
    const defaultRpcUrl = RPC_URLS[network] as string

    transports[network] = fallback([http(defaultRpcUrl), http()])
  })

  return transports
}

/**
 * Returns messages for localization through next-intl
 * @param locale the locale to fetch messages for
 * @returns
 */
export const getMessages = async (locale?: string) => {
  const defaultMessages: IntlMessages = (await import(`../messages/en.json`)).default

  if (!locale) return defaultMessages

  const localeMessages: IntlMessages = (await import(`../messages/${locale}.json`)).default
  const messages = deepmerge<IntlMessages>(defaultMessages, localeMessages)

  return messages
}

/**
 * Returns whether or not the current wallet connector supports ERC-2612 permits
 * @param connectorId the current wallet connector ID
 * @returns
 */
export const walletSupportsPermit = (connectorId?: string) => {
  return !connectorId?.toLowerCase().includes('coinbase')
}

/**
 * Returns a clean, concise URI for display purposes
 * @param uri a URI to clean up
 * @returns
 */
export const getCleanURI = (URI: string) => {
  if (URI.startsWith('http')) {
    return /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/i.exec(URI)?.[1] ?? ''
  } else if (URI.startsWith('ipfs://') || URI.startsWith('ipns://')) {
    return `${URI.slice(0, 15)}...`
  } else {
    return URI
  }
}

/**
 * Returns a formatted token amount rounded down to an appropriate number of fractional digits
 * @param amount a token amount to format
 * @param decimals the token's decimals
 * @returns
 */
export const getRoundedDownFormattedTokenAmount = (amount: bigint, decimals: number) => {
  const shiftedAmount = formatUnits(amount, decimals)

  const fractionDigits = shiftedAmount.split('.')[1] ?? ''
  const numFractionLeadingZeroes = (fractionDigits.match(/^0+/) || [''])[0].length
  const maximumFractionDigits = Math.max(Math.min(numFractionLeadingZeroes + 1, 4), 3)

  const roundingMultiplier = 10 ** maximumFractionDigits
  const roundedAmount =
    Math.floor(parseFloat(shiftedAmount) * roundingMultiplier) / roundingMultiplier

  return formatNumberForDisplay(roundedAmount, { maximumFractionDigits })
}

export const signInDisconnect = async (setUserAddress: (address: Address | undefined) => void) => {
  setUserAddress(undefined)
}

export const addRecentTransaction = () => {
  alert('implement me!')
}

export const signInWithWallet = async (setUserAddress: (address: Address | undefined) => void) => {
  if (!MiniKit.isInstalled()) {
    // toast.dismiss()
    // toast.error(
    //   `Failed !MiniKit.isInstalled(), make sure you're running this miniapp inside of the World Mobile App`,
    //   {
    //     duration: 8000,
    //     style: 'border: 2px solid var(--pt-warning-med); '
    //   }
    // )
    // console.log('failed !MiniKit.isInstalled()')
    // return

    console.log('failed !MiniKit.isInstalled()')
    return
  }

  const nonce = crypto.randomUUID().replace(/-/g, '')

  const { commandPayload: generateMessageResult, finalPayload } =
    await MiniKit.commandsAsync.walletAuth({
      nonce,
      expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      statement:
        'PoolTogether requires your address to check your WLD balance and permit deposits into the Prize Pool'
    })

  if (finalPayload.status === 'error') {
    console.log('error')
    console.log('User rejected sign in window?')

    return
  } else {
    const walletAddress = finalPayload.address as Address
    setUserAddress(walletAddress)
  }
}
