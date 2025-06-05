import { connectorsForWallets, WalletList } from '@rainbow-me/rainbowkit'
import { getInitialCustomRPCs } from '@shared/generic-react-hooks'
import { formatNumberForDisplay, NETWORK, parseQueryParam } from '@shared/utilities'
import { MiniKit } from '@worldcoin/minikit-js'
import deepmerge from 'deepmerge'
import { Address, Chain, formatUnits, http, Transport } from 'viem'
import { createConfig, CreateConnectorFn, fallback } from 'wagmi'
import { RPC_URLS, WAGMI_CHAINS, WALLETS } from '@constants/config'

// const { address: _userAddress } = useAccount()
// const userAddress = address ?? _userAddress

/**
 * Returns a Wagmi config with the given networks and RPCs
 * @param networks the networks to support throughout the app
 * @param options optional settings
 * @returns
 */
export const createCustomWagmiConfig = (
  networks: NETWORK[],
  options?: { connectors?: CreateConnectorFn[]; useCustomRPCs?: boolean }
) => {
  const supportedNetworks = Object.values(WAGMI_CHAINS).filter(
    (chain) => networks.includes(chain.id) && !!RPC_URLS[chain.id]
  ) as any as [Chain, ...Chain[]]

  return createConfig({
    chains: supportedNetworks,
    connectors: options?.connectors ?? getWalletConnectors(),
    transports: getNetworkTransports(
      supportedNetworks.map((network) => network.id),
      { useCustomRPCs: options?.useCustomRPCs }
    ),
    batch: { multicall: { batchSize: 1_024 * 1_024 } },
    ssr: true
  })
}

/**
 * Returns wallet connectors for Wagmi & RainbowKit
 * @returns
 */
const getWalletConnectors = () => {
  const walletGroups: WalletList = []

  const defaultWallets = ['injected', 'rainbow', 'metamask']

  const highlightedWallet = parseQueryParam('wallet', { validValues: Object.keys(WALLETS) })

  // NOTE: Don't highlight solely the injected wallet since it might be something sketchy.
  if (!!highlightedWallet && highlightedWallet !== 'injected') {
    walletGroups.push({
      groupName: 'Recommended',
      wallets: [WALLETS[highlightedWallet]]
    })
    walletGroups.push({
      groupName: 'Default',
      wallets: defaultWallets
        .filter((wallet) => wallet !== highlightedWallet)
        .map((wallet) => WALLETS[wallet])
    })
  } else {
    walletGroups.push({
      groupName: 'Default',
      wallets: defaultWallets.map((wallet) => WALLETS[wallet])
    })
  }

  return connectorsForWallets(walletGroups, {
    appName: 'Cabana',
    projectId: '3eb812d6ed9689e2ced204df2b9e6c76'
  })
}

/**
 * Returns network transports for Wagmi & RainbowKit
 * @param networks the networks to get transports for
 * @param options optional settings
 * @returns
 */
const getNetworkTransports = (
  networks: (keyof typeof RPC_URLS)[],
  options?: { useCustomRPCs?: boolean }
) => {
  const transports: { [chainId: number]: Transport } = {}

  const customRPCs = !!options?.useCustomRPCs ? getInitialCustomRPCs() : {}

  networks.forEach((network) => {
    const defaultRpcUrl = RPC_URLS[network] as string
    const customRpcUrl = customRPCs[network]

    transports[network] = !!customRpcUrl
      ? fallback([http(customRpcUrl), http(defaultRpcUrl), http()])
      : fallback([http(defaultRpcUrl), http()])
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

export const signInWithWallet = async () => {
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
  }

  // const res = await fetch(`/api/nonce`)
  const nonce = crypto.randomUUID().replace(/-/g, '')
  // const { nonce } = await res.json()

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

    return
  } else {
    const walletAddress = finalPayload.address as Address
    userAddress.set(walletAddress)

    // const response = await fetch('/api/complete-siwe', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     payload: finalPayload,
    //     nonce
    //   })
    // })
  }
}

// export const connect = async (providerData: EIP6963ProviderData, options?: { onConnected?: (address: Address) => void }) => {
//   const transport = custom(providerData.provider, transportSettings)

//   const _walletClient = createWalletClient({ chain, transport })

//   // Some providers only support `getAddresses` since `requestAddresses` uses optional RPC calls
//   let [address] = await _walletClient.getAddresses()
//   if (!address) {
//     address = (await _walletClient.requestAddresses())[0]
//   }

//   const publicClient = createPublicClient({ chain, transport, ...publicClientSettings }) as PublicClient
//   const walletClient = createWalletClient({ account: address, chain, transport })

//   const walletClientChainId = await walletClient.getChainId()

//   if (walletClientChainId !== chain.id) {
//     await walletClient.switchChain({ id: chain.id })
//   }

//   clients.set({ public: publicClient, wallet: walletClient })
//   userAddress.set(address)
//   lastConnectedProviderId.set(providerData.info.uuid)

//   options?.onConnected?.(address)

//   providerData.provider.on('accountsChanged', (accounts: Address[]) => {
//     if (get(lastConnectedProviderId) === providerData.info.uuid) {
//       userAddress.set(accounts[0])
//     }
//   })

//   return address
// }

export const disconnect = async () => {
  localStorage.removeItem(localStorageKeys.userAddress)
  userAddress.set(undefined)
  // clients.set(getInitialClients())
}

export const updateAddressVerifiedUntil = async (userAddress: Address) => {
  const publicClient = get(clients).public

  const until = await publicClient.readContract({
    address: worldIdAddressBook.address,
    abi: worldIdABI,
    functionName: 'addressVerifiedUntil',
    args: [userAddress]
  })

  addressVerifiedUntil.set(until)
}

export const getAccountDepositLimit = async () => {
  const publicClient = get(clients).public

  if (!get(accountDepositLimit)) {
    const limit = (await publicClient.readContract({
      address: prizeVault.address,
      abi: vaultABI,
      functionName: 'accountDepositLimit'
    })) as bigint

    accountDepositLimit.set(limit)
  }
}

export const getUsernamesInfo = async (address?: Address) => {
  const USERNAMES_URL = 'https://usernames.worldcoin.org/api/v1/'

  if (!address) {
    usernameResult.set({ address: null, username: null, profile_picture_url: null })
  } else if (!get(usernameResult) || address !== get(usernameResult).address) {
    usernameResult.set({ address, username: null, profile_picture_url: null })

    const uri = `${USERNAMES_URL}${address}`

    try {
      const response = await fetch(uri, {
        method: 'GET'
      })

      if (!response.ok) {
        console.error(`Response status: ${response.status}`)
      }
      usernameResult.set(await response.json())
    } catch (error: any) {
      console.error(error.message)
    }
  }
}
