import { NoneTransferableERC20Abi, permitDepositABI, redeemABI, vaultABI } from '@shared/utilities'
import { lower } from '@shared/utilities'
// import { lower } from './formatting'
import { type MiniAppSendTransactionSuccessPayload, MiniKit } from '@worldcoin/minikit-js'
import { Address, decodeEventLog, type Hash, type TransactionReceipt } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'

const PERMIT_2_VAULT_DEPOSIT_ADDRESS: Address = '0x263f95fF28347F14956dA6c26d51b2701Ed95013'

export type DepositTxOptions = {
  onSend?: () => void
  onSuccess?: (depositEvent: ReturnType<typeof decodeDepositEvent>, txHash: Address) => void
  onSettled?: () => void
  onError?: () => void
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
  options?: DepositTxOptions
) => {
  // re-write all this and put it in some useSendWorlDepositTransaction hook so we don't have to do this janky stuff:
  if (!prizeVaultAssetAddress) {
    return
  }

  const nonce = Date.now().toString()
  const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString()

  return await sendDepositTx(
    {
      address: PERMIT_2_VAULT_DEPOSIT_ADDRESS,
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
      onSuccess: (txReceipt: any, txHash: Address) =>
        options?.onSuccess?.(decodeDepositEvent(prizeVaultAddress, txReceipt), txHash)
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
    onSuccess?: (txReceipt: TransactionReceipt, txHash: Address) => void
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
    spender: PERMIT_2_VAULT_DEPOSIT_ADDRESS
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
      // throw new Error(finalPayload?.error_code)
    } else {
      options?.onSend?.()

      const txReceipt = await getTxReceipt(publicClient, finalPayload)
      console.log('txReceipt')
      console.log(txReceipt)

      if (txReceipt) {
        options?.onSuccess?.(txReceipt, txReceipt.transactionHash)
      } else {
        // throw new Error('Unable to get txReceipt')
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
    const transactionHashResponse = await fetch(
      `/api/waitForWorldMinikitTransactionHash?transactionId=${payload.transaction_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

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
    onSuccess?: (withdrawEvent: ReturnType<typeof decodeWithdrawEvent>, txHash: Address) => void
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
      onSuccess: (txReceipt: any, txHash: Address) =>
        options?.onSuccess?.(decodeWithdrawEvent(prizeVaultAddress, txReceipt), txHash)
    }
  )
}

export const sendTx = async (
  txRequest: any,
  publicClient: any,
  options?: {
    onSend?: () => void
    onSuccess?: (txReceipt: TransactionReceipt, txHash: Address) => void
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
      // throw new Error(finalPayload?.error_code)
    } else {
      options?.onSend?.()

      const txReceipt = await getTxReceipt(publicClient, finalPayload)

      if (txReceipt) {
        options?.onSuccess?.(txReceipt, txReceipt.transactionHash)
      } else {
        // throw new Error('Unable to get txReceipt')
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
