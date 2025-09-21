import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  calculatePercentageOfBigInt,
  DOLPHIN_ADDRESS,
  lower,
  NETWORK,
  WRAPPED_NATIVE_ASSETS,
  ZAP_SETTINGS,
  zapRouterABI
} from '@shared/utilities'
import { useEffect, useMemo, useRef } from 'react'
import { Address, encodeFunctionData, isAddress, TransactionReceipt } from 'viem'
import { useAccount, useChainId } from 'wagmi'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useGasAmountEstimate, useTokenAllowance, useVaultTokenData, useZapArgs, useSendGenericApproveTransaction } from '..'

/**
 * Prepares and submits a zap transaction that includes swapping and depositing into a vault
 * @param inputToken the token the user is providing
 * @param vault the vault to deposit into
 * @param options optional callbacks
 * @returns
 */
export const useSendDepositZapTransaction = (
  inputToken: { address: Address; decimals: number; amount: bigint },
  vault: Vault,
  options?: {
    onSend?: (txHash: `0x${string}`) => void
    onSuccess?: (txReceipt: TransactionReceipt) => void
    onError?: () => void
  }
): {
  isWaiting: boolean
  isConfirming: boolean
  isSuccess: boolean
  isError: boolean
  txHash?: Address
  txReceipt?: TransactionReceipt
  sendDepositZapTransaction?: () => void
  amountOut?: { expected: bigint; min: bigint }
  isFetchedZapArgs: boolean
  isFetchingZapArgs: boolean
  approvalTarget?: Address
  needsApproval: boolean
  approvalTx: {
    isWaiting: boolean
    isConfirming: boolean
    isSuccess: boolean
    isError: boolean
    txHash?: Address
    txReceipt?: TransactionReceipt
    sendApproveTransaction?: () => void
  }
} => {
  // Track previous parameters to prevent unnecessary re-runs
  const prevParamsRef = useRef<{
    inputTokenAddress: string
    inputTokenDecimals: number
    inputTokenAmount: string
    vaultAddress: string
    vaultChainId: number
  }>()

  const currentParams = {
    inputTokenAddress: inputToken?.address || '',
    inputTokenDecimals: inputToken?.decimals || 0,
    inputTokenAmount: inputToken?.amount?.toString() || '0',
    vaultAddress: vault?.address || '',
    vaultChainId: vault?.chainId || 0
  }

  // Check if parameters have changed
  const paramsChanged = !prevParamsRef.current ||
    prevParamsRef.current.inputTokenAddress !== currentParams.inputTokenAddress ||
    prevParamsRef.current.inputTokenDecimals !== currentParams.inputTokenDecimals ||
    prevParamsRef.current.inputTokenAmount !== currentParams.inputTokenAmount ||
    prevParamsRef.current.vaultAddress !== currentParams.vaultAddress ||
    prevParamsRef.current.vaultChainId !== currentParams.vaultChainId

  if (paramsChanged) {
    prevParamsRef.current = currentParams
    console.log('🚀🚀🚀 useSendDepositZapTransaction HOOK STARTED 🚀🚀🚀')
    console.log('useSendDepositZapTransaction called with:', {
      inputToken: inputToken?.address,
      vault: vault?.address,
      chainId: vault?.chainId
    })
  }

  const { address: userAddress, chain } = useAccount()
  const wagmiChainId = useChainId()

  // Chain detection with fallbacks
  const currentChainId = chain?.id || wagmiChainId

  console.log('🔍 SIMPLE DEBUG - Chain detection:', {
    'chain?.id': chain?.id,
    'wagmiChainId': wagmiChainId,
    'currentChainId': currentChainId,
    'vault.chainId': vault.chainId,
    'chainMatches': currentChainId === vault.chainId
  })

  console.log('🔥🔥🔥 CHAIN DETECTION COMPLETE 🔥🔥🔥')

  const { zapRouter, zapTokenManager } = ZAP_SETTINGS[vault?.chainId] ?? {}

  const { data: vaultTokenData } = useVaultTokenData(vault!)

  // Debug vault token data
  console.log('Vault token data for zap:', {
    vaultAddress: vault.address,
    vaultTokenData: vaultTokenData?.address,
    vaultTokenSymbol: vaultTokenData?.symbol,
    vaultTokenName: vaultTokenData?.name,
    vaultTokenDecimals: vaultTokenData?.decimals
  })

  // IMPORTANT: Use vault address as outputToken parameter (like Cabana)
  // useZapTokenInfo will automatically resolve vault.address → underlying token (cbETH)
  // ParaSwap swaps to underlying token (cbETH)
  // Deposit step converts underlying → vault shares
  const outputToken = {
    address: vault.address,
    decimals: vault.decimals || 18
  }

  console.log('useZapArgs call parameters:', {
    chainId: vault.chainId,
    inputToken: inputToken?.address,
    inputTokenDecimals: inputToken?.decimals,
    inputTokenAmount: inputToken?.amount?.toString(),
    outputToken: outputToken.address,
    outputTokenDecimals: outputToken.decimals,
    vaultAddress: vault.address,
    vaultTokenData: vaultTokenData?.address
  })

  console.log('About to call useZapArgs with:', {
    chainId: vault.chainId,
    inputToken: inputToken?.address,
    outputToken: outputToken.address,
    vaultAddress: vault.address,
    vaultTokenData: vaultTokenData?.address
  })

  const {
    zapArgs,
    amountOut,
    isFetched: isFetchedZapArgs,
    isFetching: isFetchingZapArgs
  } = useZapArgs(vault.chainId, inputToken, outputToken)

  console.log('useZapArgs result:', {
    zapArgs: !!zapArgs,
    amountOut: !!amountOut,
    isFetchedZapArgs,
    isFetchingZapArgs
  })

  // Use zapTokenManager as approval target (matches Cabana approach)
  const { data: allowance, isFetched: isFetchedAllowance } = useTokenAllowance(
    vault?.chainId,
    userAddress!,
    zapTokenManager, // Use zapTokenManager for approvals (Uniswap Permit2)
    inputToken?.address
  )

  // Check if approval is needed
  const needsApproval =
    !!inputToken?.address &&
    lower(inputToken.address) !== DOLPHIN_ADDRESS &&
    allowance !== undefined &&
    allowance < inputToken.amount

  // Approval transaction (only if needed)
  const approvalTx = useSendGenericApproveTransaction(
    vault?.chainId,
    inputToken?.address!,
    zapTokenManager!,
    inputToken?.amount!,
    {
      onSuccess: () => {
        console.log('✅ Approval transaction successful, refetching allowance...')
        // The allowance will be refetched automatically by the hook
      }
    }
  )

  // Debug zapArgs structure
  if (zapArgs) {
    console.log('🔍 ZAP ARGS STRUCTURE:', {
      zapArgs: zapArgs,
      zapArgsLength: zapArgs.length,
      zapArgsTypes: zapArgs.map((arg, index) => ({
        index,
        type: typeof arg,
        value: arg,
        isBigInt: typeof arg === 'bigint',
        isString: typeof arg === 'string',
        isAddress: typeof arg === 'string' && (arg as string).startsWith('0x')
      }))
    })
  }

  const enabled = useMemo(() => {
    return !!inputToken?.address &&
      inputToken.decimals !== undefined &&
      !!inputToken.amount &&
      inputToken.amount > 0n &&
      !!vault &&
      !!userAddress &&
      isAddress(userAddress) &&
      currentChainId === vault.chainId &&
      !!zapRouter &&
      !!zapTokenManager &&
      isFetchedAllowance &&
      allowance !== undefined &&
      (lower(inputToken.address) === DOLPHIN_ADDRESS || allowance >= inputToken.amount)
  }, [
    inputToken?.address,
    inputToken?.decimals,
    inputToken?.amount,
    vault,
    userAddress,
    currentChainId,
    zapRouter,
    zapTokenManager,
    isFetchedAllowance,
    allowance
  ])

  // Split the debug log to avoid truncation
  console.log('useSendDepositZapTransaction - enabled conditions part 1:', {
    hasInputTokenAddress: !!inputToken?.address,
    hasInputTokenDecimals: inputToken.decimals !== undefined,
    hasInputTokenAmount: !!inputToken.amount,
    hasVault: !!vault,
    hasUserAddress: !!userAddress,
    isUserAddressValid: !!userAddress && isAddress(userAddress)
  })

  // Debug each condition individually
  console.log('🔍 ENABLED CONDITIONS BREAKDOWN:', {
    'inputToken?.address': inputToken?.address,
    'inputToken.decimals': inputToken.decimals,
    'inputToken.amount': inputToken.amount,
    'vault': !!vault,
    'userAddress': userAddress,
    'isAddress(userAddress)': userAddress ? isAddress(userAddress) : false,
    'currentChainId': currentChainId,
    'vault.chainId': vault?.chainId,
    'currentChainId === vault.chainId': currentChainId === vault?.chainId,
    'zapRouter': zapRouter,
    'zapTokenManager': zapTokenManager,
    'isFetchedAllowance': isFetchedAllowance,
    'allowance': allowance,
    'allowance !== undefined': allowance !== undefined,
    'inputToken.address === DOLPHIN_ADDRESS': inputToken.address && lower(inputToken.address) === DOLPHIN_ADDRESS,
    'allowance >= inputToken.amount': allowance !== undefined && allowance >= inputToken.amount,
    'finalEnabled': enabled
  })

  console.log('useSendDepositZapTransaction - enabled conditions part 2:', {
    chainMatches: currentChainId === vault.chainId,
    chainId: chain?.id,
    wagmiChainId: wagmiChainId,
    currentChainId: currentChainId,
    vaultChainId: vault.chainId
  })

  console.log('useSendDepositZapTransaction - enabled conditions part 3:', {
    hasZapRouter: !!zapRouter,
    hasZapTokenManager: !!zapTokenManager,
    isFetchedAllowance,
    hasAllowance: allowance !== undefined,
    allowanceValue: allowance?.toString(),
    inputTokenAmount: inputToken.amount?.toString()
  })

  console.log('useSendDepositZapTransaction - enabled conditions part 4:', {
    isETH: lower(inputToken.address) === DOLPHIN_ADDRESS,
    isETHOrHasAllowance: lower(inputToken.address) === DOLPHIN_ADDRESS || (allowance !== undefined && allowance >= inputToken.amount),
    enabled
  })

  // Additional debug to see exactly what's failing
  console.log('useSendDepositZapTransaction - CRITICAL DEBUG:', {
    'inputToken.address': inputToken?.address,
    'inputToken.decimals': inputToken.decimals,
    'inputToken.amount': inputToken.amount?.toString(),
    'vault': !!vault,
    'userAddress': userAddress,
    'isAddress(userAddress)': !!userAddress && isAddress(userAddress),
    'currentChainId': currentChainId,
    'vault.chainId': vault.chainId,
    'chainMatches': currentChainId === vault.chainId,
    'zapRouter': zapRouter,
    'zapTokenManager': zapTokenManager,
    'isFetchedAllowance': isFetchedAllowance,
    'allowance': allowance?.toString(),
    'isETH': lower(inputToken.address) === DOLPHIN_ADDRESS,
    'allowance >= inputToken.amount': allowance !== undefined && allowance >= inputToken.amount,
    'enabled': enabled
  })

  const { data: gasEstimate } = useGasAmountEstimate(
    vault?.chainId,
    {
      address: zapRouter,
      abi: [zapRouterABI['15']], // Use ABI slice like Cabana
      functionName: 'executeOrder',
      args: zapArgs!,
      account: userAddress
    },
    { enabled: enabled && !!zapArgs }
  )

  // Enable simulation to check for errors
  const { data, error: simulateError, isError: isSimulateError } = useSimulateContract({
    address: zapRouter,
    abi: [zapRouterABI['15']], // Use ABI slice like Cabana
    functionName: 'executeOrder',
    args: zapArgs, // No ! operator like Cabana
    value: !!inputToken?.address && lower(inputToken.address) === DOLPHIN_ADDRESS
      ? inputToken.amount
      : 0n,
    query: {
      enabled: enabled && !!zapArgs
    }
  })

  // Debug simulation query conditions
  console.log('🔍 SIMULATION QUERY DEBUG:', {
    zapRouter,
    zapArgs: !!zapArgs,
    zapArgsLength: zapArgs?.length,
    userAddress,
    enabled,
    queryEnabled: enabled && !!zapArgs,
    hasZapRouter: !!zapRouter,
    hasZapArgs: !!zapArgs,
    hasUserAddress: !!userAddress,
    zapRouterType: typeof zapRouter,
    zapArgsType: typeof zapArgs,
    userAddressType: typeof userAddress,
    value: !!inputToken?.address && lower(inputToken.address) === DOLPHIN_ADDRESS ? inputToken.amount : 0n,
    isETH: !!inputToken?.address && lower(inputToken.address) === DOLPHIN_ADDRESS,
    gasEstimate: gasEstimate?.toString()
  })

  // Debug sender vs order.user mismatch
  if (zapArgs && zapArgs.length >= 1) {
    const order = zapArgs[0] as any
    console.log('🔍 SENDER VS ORDER.USER DEBUG:', {
      orderUser: order?.user,
      orderRecipient: order?.recipient,
      userAddress: userAddress,
      userAddressMatch: order?.user === userAddress,
      recipientMatch: order?.recipient === userAddress
    })

    // Debug relay data
    if (order?.relay) {
      console.log('🔍 RELAY DATA DEBUG:', {
        relayTarget: order.relay.target,
        relayValue: order.relay.value,
        relayData: order.relay.data,
        relayDataLength: order.relay.data?.length,
        relayDataPreview: order.relay.data?.substring(0, 20) + '...',
        isRelayDataEmpty: order.relay.data === '0x',
        isRelayDataZero: order.relay.data === '0x0'
      })
    }

    // Debug outputs and min amounts
    if (order?.outputs) {
      console.log('🔍 OUTPUTS DEBUG:', {
        outputsLength: order.outputs.length,
        outputs: order.outputs.map((output: any, index: number) => ({
          index,
          token: output.token,
          minOutputAmount: output.minOutputAmount?.toString(),
          minOutputAmountBN: output.minOutputAmount
        }))
      })
    }
  }

  // Debug route steps and aggregator target addresses
  if (zapArgs && zapArgs.length >= 2) {
    console.log('🔍 ROUTE STEPS DEBUG:', {
      routeLength: zapArgs[1]?.length || 0,
      routeSteps: zapArgs[1]?.map((step, index) => ({
        stepIndex: index,
        target: step.target,
        value: step.value?.toString(),
        dataLength: step.data?.length,
        tokens: step.tokens?.map(token => ({
          token: token.token,
          index: token.index
        }))
      })) || []
    })

    // Debug the specific error signature
    console.log('🔍 ERROR SIGNATURE DEBUG:', {
      errorSignature: '0x7a2ee929',
      errorSignatureBytes: '0x7a2ee929',
      possibleSources: [
        'ParaSwap contract (0x6a00...068)',
        'Vault contract (0x5b62...b9d5)',
        'Zap router (0x6F19...6a63)',
        'Token contract (USDC or cbETH)'
      ],
      note: 'This error is not in the zap router ABI, so it comes from another contract'
    })
  }

  console.log('useSimulateContract result:', {
    data: !!data,
    dataRequest: data?.request,
    simulateError: simulateError?.message || simulateError,
    isSimulateError,
    enabled,
    hasZapArgs: !!zapArgs,
    queryEnabled: enabled && !!zapArgs,
    simulationStatus: data ? 'SUCCESS' : isSimulateError ? 'FAILED' : 'PENDING',
    canSendTransaction: !!zapArgs && enabled && data,
    dataType: typeof data,
    dataKeys: data ? Object.keys(data) : 'no data',
    // Additional debugging
    zapRouterAddress: zapRouter,
    userAddressForSim: userAddress,
    zapArgsLength: zapArgs?.length,
    zapArgsFirstArg: zapArgs?.[0] ? 'present' : 'missing',
    zapArgsSecondArg: zapArgs?.[1] ? 'present' : 'missing'
  })

  // Log the full error object to see the revert reason
  if (simulateError) {
    console.error('🚨 FULL SIMULATION ERROR:', simulateError)

    // Check if this is an allowance issue
    console.error('🔍 ALLOWANCE DEBUG:', {
      inputTokenAddress: inputToken?.address,
      inputTokenAmount: inputToken?.amount?.toString(),
      allowance: allowance?.toString(),
      allowanceGteAmount: allowance !== undefined && allowance >= (inputToken?.amount || 0n),
      zapRouter: zapRouter,
      userAddress: userAddress
    })

    // Check if this is a swap route issue
    console.error('🔍 SWAP ROUTE DEBUG:', {
      zapArgs: zapArgs ? 'present' : 'missing',
      zapArgsLength: zapArgs?.length,
      firstArg: zapArgs?.[0] ? 'present' : 'missing',
      secondArg: zapArgs?.[1] ? 'present' : 'missing',
      routeLength: zapArgs?.[1] ? zapArgs[1].length : 0,
      hasSwapTx: zapArgs?.[1] ? zapArgs[1].length > 0 : false
    })

    // Check if this is a token approval issue
    console.error('🔍 TOKEN APPROVAL DEBUG:', {
      isETH: lower(inputToken?.address || '') === DOLPHIN_ADDRESS,
      wrappedNativeToken: WRAPPED_NATIVE_ASSETS[vault?.chainId],
      zapRouter: ZAP_SETTINGS[vault?.chainId]?.zapRouter,
      zapTokenManager: ZAP_SETTINGS[vault?.chainId]?.zapTokenManager,
      allowanceTarget: zapTokenManager, // Show which contract we're checking allowance against
      needsTokenApproval: lower(inputToken?.address || '') !== DOLPHIN_ADDRESS && allowance !== undefined && allowance < (inputToken?.amount || 0n)
    })
  }

  // Log detailed simulation error if it exists
  if (simulateError) {
    console.error('🚨 SIMULATION ERROR DETAILS:', {
      error: simulateError,
      message: simulateError?.message,
      cause: simulateError?.cause
    })
  }

  // Debug zap args content
  if (zapArgs) {
    console.log('🔍 ZAP ARGS CONTENT:', {
      zapArgs,
      zapArgsLength: zapArgs.length,
      firstArg: zapArgs[0],
      secondArg: zapArgs[1],
      firstArgKeys: zapArgs[0] ? Object.keys(zapArgs[0]) : 'not object',
      secondArgKeys: zapArgs[1] ? Object.keys(zapArgs[1]) : 'not object'
    })

    // Log detailed content with BigInt serialization
    const serializeBigInt = (obj: any): any => {
      if (obj === null || obj === undefined) return obj
      if (typeof obj === 'bigint') return obj.toString()
      if (Array.isArray(obj)) return obj.map(serializeBigInt)
      if (typeof obj === 'object') {
        const result: any = {}
        for (const [key, value] of Object.entries(obj)) {
          result[key] = serializeBigInt(value)
        }
        return result
      }
      return obj
    }

    console.log('🔍 FIRST ARG (Order):', JSON.stringify(serializeBigInt(zapArgs[0]), null, 2))
    console.log('🔍 SECOND ARG (Route):', JSON.stringify(serializeBigInt(zapArgs[1]), null, 2))
  }

  // Simulation bypassed - using direct transaction execution

  const {
    data: txHash,
    isPending: isWaiting,
    isError: isSendingError,
    isSuccess: isSendingSuccess,
    writeContract: _sendDepositZapTransaction,
    error: writeContractError
  } = useWriteContract()

  // Debug writeContract errors
  if (writeContractError) {
    console.error('🚨 WriteContract error:', writeContractError)
  }

  // Create transaction function with fallback when simulation fails
  const sendDepositZapTransaction = useMemo(() => {
    if (!!data && data.request) {
      // Use simulation result if available
      console.log('✅ Using simulation result for transaction')
      return () => _sendDepositZapTransaction(data.request)
    } else if (enabled && !!zapArgs && !!zapRouter) {
      // Fallback: create transaction directly when simulation fails
      console.log('⚠️ Simulation failed, using fallback transaction creation')
      return () => _sendDepositZapTransaction({
        address: zapRouter,
        abi: [zapRouterABI['15']],
        functionName: 'executeOrder',
        args: zapArgs,
        ...(!!inputToken?.address && lower(inputToken.address) === DOLPHIN_ADDRESS
          ? { value: inputToken.amount }
          : {})
      })
    }
    return undefined
  }, [data, enabled, zapArgs, zapRouter, inputToken, _sendDepositZapTransaction])

  // Debug transaction state
  console.log('🔍 Transaction state debug:', {
    isWaiting,
    isSendingError,
    isSendingSuccess,
    txHash,
    hasSendDepositZapTransaction: !!sendDepositZapTransaction,
    sendDepositZapTransactionType: typeof sendDepositZapTransaction
  })

  // Debug contract details
  console.log('🔍 CONTRACT DETAILS:', {
    zapRouter,
    zapRouterType: typeof zapRouter,
    isAddress: zapRouter ? zapRouter.startsWith('0x') : false,
    abiLength: zapRouterABI.length,
    abiIndex15: zapRouterABI[15],
    abiIndex15Name: zapRouterABI[15]?.name,
    abiIndex15StateMutability: zapRouterABI[15]?.stateMutability,
    abiIndex15InputsLength: zapRouterABI[15]?.inputs?.length
  })

  // Debug ABI index 15 in detail
  console.log('🔍 ABI INDEX 15 DETAILS:', JSON.stringify(zapRouterABI[15], null, 2))

  // Debug any transaction errors
  if (isSendingError) {
    console.error('🚨 Transaction error detected:', {
      isSendingError,
      isWaiting,
      isSendingSuccess,
      txHash,
      enabled,
      hasZapArgs: !!zapArgs,
      zapArgsLength: zapArgs?.length
    })
  }

  useEffect(() => {
    if (!!txHash && isSendingSuccess) {
      options?.onSend?.(txHash)
    }
  }, [isSendingSuccess])

  const {
    data: txReceipt,
    isFetching: isConfirming,
    isSuccess,
    isError: isConfirmingError
  } = useWaitForTransactionReceipt({ chainId: vault?.chainId, hash: txHash })

  useEffect(() => {
    if (!!txReceipt && isSuccess) {
      options?.onSuccess?.(txReceipt)
    }
  }, [isSuccess])

  const isError = isSendingError || isConfirmingError

  useEffect(() => {
    if (isError) {
      options?.onError?.()
    }
  }, [isError])

  return {
    isWaiting,
    isConfirming,
    isSuccess,
    isError,
    txHash,
    txReceipt,
    sendDepositZapTransaction,
    amountOut,
    isFetchedZapArgs,
    isFetchingZapArgs,
    approvalTarget: zapTokenManager,
    needsApproval,
    approvalTx: {
      isWaiting: approvalTx.isWaiting,
      isConfirming: approvalTx.isConfirming,
      isSuccess: approvalTx.isSuccess,
      isError: approvalTx.isError,
      txHash: approvalTx.txHash,
      txReceipt: approvalTx.txReceipt,
      sendApproveTransaction: approvalTx.sendApproveTransaction
    }
  }
}
