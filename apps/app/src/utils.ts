import { NoneTransferableERC20Abi, permitDepositABI, redeemABI, vaultABI } from '@shared/utilities'
import { formatNumberForDisplay, lower, NETWORK, parseQueryParam } from '@shared/utilities'
// import { lower } from './formatting'
import { type MiniAppSendTransactionSuccessPayload, MiniKit } from '@worldcoin/minikit-js'
import deepmerge from 'deepmerge'
import {
  Address,
  Chain,
  decodeEventLog,
  formatUnits,
  type Hash,
  http, // type PublicClient,
  type TransactionReceipt,
  Transport
} from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { createConfig, fallback } from 'wagmi'
import { RPC_URLS, WAGMI_CHAINS } from '@constants/config'

export const permit2VaultDeposit: { address: Address } = {
  address: '0x263f95fF28347F14956dA6c26d51b2701Ed95013'
}

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
  // clients.set(getInitialClients())
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
    console.log('User rejected sign in window?')

    return
  } else {
    const walletAddress = finalPayload.address as Address
    setUserAddress(walletAddress)
  }
}

export const decodeDepositEvent = (
  prizeVaultAddress: Address,
  depositTxReceipt: TransactionReceipt
) => {
  const { topics, data } = depositTxReceipt.logs.filter(
    (log) => lower(log.address) === lower(prizeVaultAddress)
  )[1]
  return decodeEventLog({ abi: vaultABI, eventName: 'Deposit', topics, data, strict: true })
}

export const deposit = async (
  amount: bigint,
  publicClient: any,
  prizeVaultAddress: Address,
  prizeVaultAssetAddress?: Address,
  options?: {
    onSend?: () => void
    onSuccess?: (depositEvent: ReturnType<typeof decodeDepositEvent>) => void
    onSettled?: () => void
    onError?: () => void
  }
) => {
  // re-write all this and put it in some useSendWorlDepositTransaction hook so we don't have to do this janky stuff:
  if (!prizeVaultAssetAddress) {
    return
  }

  const nonce = Date.now().toString()
  const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString()

  return await sendDepositTx(
    {
      address: permit2VaultDeposit.address,
      abi: permitDepositABI,
      functionName: 'permitDeposit',
      args: [
        prizeVaultAddress,
        amount.toString(),
        nonce,
        deadline,
        'PERMIT2_SIGNATURE_PLACEHOLDER_0'
      ]
    },
    publicClient,
    prizeVaultAssetAddress,
    {
      ...options,
      onSuccess: (txReceipt: any) =>
        options?.onSuccess?.(decodeDepositEvent(prizeVaultAddress, txReceipt))
    }
  )
}

// This differs from the generic sendTx below because it requires an intermediary permit2 contract
export const sendDepositTx = async (
  txRequest: any,
  publicClient: any,
  prizeVaultAssetAddress: Address,
  options?: {
    onSend?: () => void
    onSuccess?: (txReceipt: TransactionReceipt) => void
    onSettled?: () => void
    onError?: () => void
  }
) => {
  if (!MiniKit.isInstalled()) {
    return
  }

  const amount = txRequest.args[1]
  const nonce = txRequest.args[2]
  const deadline = txRequest.args[3]

  const permit2 = {
    permitted: {
      token: prizeVaultAssetAddress, // prizeVault.asset.address, (underlying)
      amount
    },
    nonce,
    deadline,
    spender: permit2VaultDeposit.address
  }

  try {
    const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [txRequest],
      permit2: [permit2]
    })

    if (finalPayload.status === 'error') {
      console.error('debugUrl')
      console.error(finalPayload?.details?.debugUrl)
      console.error('simulationError')
      console.error(finalPayload?.details?.simulationError)
      throw new Error(finalPayload?.error_code)
    } else {
      options?.onSend?.()

      const txReceipt = await getTxReceipt(publicClient, finalPayload)

      if (txReceipt) {
        options?.onSuccess?.(txReceipt)
      } else {
        throw new Error('Unable to get txReceipt')
      }
    }
  } catch (e) {
    console.error(e)
    options?.onError?.()
    throw e
  } finally {
    options?.onSettled?.()
  }
}

export const getTxReceipt = async (
  publicClient: any,
  payload: MiniAppSendTransactionSuccessPayload
) => {
  let txReceipt
  try {
    const transactionHashResponse = await fetch('/api/waitForWorldMinikitTransactionHash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payload })
    })

    if (transactionHashResponse.status === 200) {
      const transactionHash = (await transactionHashResponse.json()).transactionHash

      txReceipt = await waitForTransactionReceipt(publicClient, {
        hash: transactionHash as Hash
      })
    }
  } catch (e) {
    console.log('error')
    console.log(e)
  }

  return txReceipt
}

export const decodeWithdrawEvent = (
  prizeVaultAddress: Address,
  redeemTxReceipt: TransactionReceipt
) => {
  const { topics, data } = redeemTxReceipt.logs.filter(
    (log) => lower(log.address) === lower(prizeVaultAddress)
  )[1]
  return decodeEventLog({ abi: vaultABI, eventName: 'Withdraw', topics, data, strict: true })
}

export const redeem = async (
  amount: bigint,
  publicClient: any,
  userAddress: Address,
  prizeVaultAddress: Address,
  options?: {
    onSend?: () => void
    onSuccess?: (withdrawEvent: ReturnType<typeof decodeWithdrawEvent>) => void
    onSettled?: () => void
    onError?: () => void
  }
) => {
  return await sendTx(
    {
      address: prizeVaultAddress,
      abi: redeemABI,
      functionName: 'redeem',
      args: [amount.toString(), userAddress, userAddress]
    },
    publicClient,
    {
      ...options,
      onSuccess: (txReceipt: any) =>
        options?.onSuccess?.(decodeWithdrawEvent(prizeVaultAddress, txReceipt))
    }
  )
}

export const sendTx = async (
  txRequest: any,
  publicClient: any,
  options?: {
    onSend?: () => void
    onSuccess?: (txReceipt: TransactionReceipt) => void
    onSettled?: () => void
    onError?: () => void
  }
) => {
  if (!MiniKit.isInstalled()) {
    return
  }

  try {
    const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [txRequest]
    })
    if (finalPayload.status === 'error') {
      console.error('debugUrl')
      console.error(finalPayload?.details?.debugUrl)
      console.error('simulationError')
      console.error(finalPayload?.details?.simulationError)
      throw new Error(finalPayload?.error_code)
    } else {
      options?.onSend?.()

      const txReceipt = await getTxReceipt(publicClient, finalPayload)

      if (txReceipt) {
        options?.onSuccess?.(txReceipt)
      } else {
        throw new Error('Unable to get txReceipt')
      }
    }
  } catch (e) {
    console.error(e)
    options?.onError?.()
    throw e
  } finally {
    options?.onSettled?.()
  }
}

// export const decodeTransferEvent = (
//   userAddress: Address,
// prizeVaultAddress: Address,
//   transferTxReceipt: TransactionReceipt
// ) => {
//   console.log('transferTxReceipt')
//   console.log(transferTxReceipt)
//   // transferTxReceipt.logs.filter((log) => lower(log.address) === lower(prizeVaultAddress))
//   const { topics, data } = transferTxReceipt.logs.filter((log) => {
//     console.log(log)
//     return lower(log.address) === lower(userAddress as Address)
//   })[0]
//   return decodeEventLog({
//     abi: NoneTransferableERC20Abi,
//     eventName: 'SafeMultiSigTransaction',
//     topics,
//     data,
//     strict: true
//   })
// }

// export const test = async (
//   userAddress: Address,
//   prizeVaultAddress: Address,
//   options?: {
//     onSend?: () => void
//     onSuccess?: (transferEvent: ReturnType<typeof decodeTransferEvent>) => void
//     onSettled?: () => void
//     onError?: () => void
//   }
// ) => {
//   return await sendTestTx(
//     {
//       address: '0x4200000000000000000000000000000000000006',
//       abi: NoneTransferableERC20Abi,
//       functionName: 'transfer',
//       args: [userAddress, '1']
//     },
//     {
//       ...options,
//       onSuccess: (txReceipt: any) =>
//         options?.onSuccess?.(decodeTransferEvent(userAddress, prizeVaultAddress, txReceipt))
//     }
//   )
// }

// export const sendTestTx = async (
//   txRequest: any,
//   publicClient: any,
//   options?: {
//     onSend?: () => void
//     onSuccess?: (txReceipt: TransactionReceipt) => void
//     onSettled?: () => void
//     onError?: () => void
//   }
// ) => {
//   if (!MiniKit.isInstalled()) {
//     return
//   }

//   try {
//     const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
//       transaction: [txRequest]
//     })

//     console.log('finalPayload')
//     console.log(finalPayload)

//     if (finalPayload.status === 'error') {
//       console.error('debugUrl')
//       console.error(finalPayload?.details?.debugUrl)
//       console.error('simulationError')
//       console.error(finalPayload?.details?.simulationError)
//       throw new Error(finalPayload?.error_code)
//     } else {
//       options?.onSend?.()

//       const txReceipt = await getTxReceipt(publicClient, finalPayload)

//       if (txReceipt) {
//         options?.onSuccess?.(txReceipt)
//       } else {
//         throw new Error('Unable to get txReceipt')
//       }
//     }
//   } catch (e) {
//     console.error(e)
//     options?.onError?.()
//     throw e
//   } finally {
//     options?.onSettled?.()
//   }
// }
