import { calculatePercentageOfBigInt, lower, sToMs } from '@shared/utilities'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
// import { usePublicClient } from 'wagmi'
import { useBasePublicClient } from '../blockchain/useClients'

interface ParaSwapPricesResponse {
  priceRoute?: {
    bestRoute: object[]
    blockNumber: number
    contractAddress: Address
    contractMethod: string
    destAmount: string
    destDecimals: number
    destToken: string
    destUSD?: string
    gasCost: string
    gasCostL1Wei?: string
    gasCostUSD?: string
    hmac: string
    maxImpactReached: boolean
    network: number
    partner: string
    partnerFee: number
    side: 'SELL'
    srcAmount: string
    srcDecimals: number
    srcToken: Address
    srcUSD?: string
    tokenTransferProxy: Address
    version: string
  }
  error?: string
}

interface ParaSwapTxRequestBody {
  srcToken: Address
  srcDecimals: number
  srcAmount: string
  destToken: Address
  destDecimals: number
  slippage: number
  userAddress: Address
  partner: string
  priceRoute: ParaSwapPricesResponse['priceRoute']
}

interface ParaSwapTxResponse {
  chainId: number
  data: `0x${string}`
  to: Address
  value: string
}

interface SwapTx {
  target: Address
  value: bigint
  data: `0x${string}`
}

/**
 * Returns transaction data and basic stats about a possible swap transaction
 * @param swapData data necessary to format swap transaction
 * @returns
 */
export const useSwapTx = (swapData: {
  chainId: number
  from: { address: Address; decimals: number; amount: bigint }
  to: { address: Address; decimals: number }
  userAddress: Address
  options?: { slippage?: number; enabled?: boolean }
}) => {
  const { chainId, from, to, userAddress, options } = swapData ?? {}

  // const publicClient = usePublicClient({ chainId })
  const publicClient = useBasePublicClient()

  const slippage = options?.slippage ?? 100

  const enabled =
    !!chainId &&
    !!from?.address &&
    from.decimals !== undefined &&
    !!from.amount &&
    !!to?.address &&
    to.decimals !== undefined &&
    lower(from.address) !== lower(to.address) &&
    !!userAddress &&
    !!publicClient &&
    slippage !== undefined &&
    options?.enabled !== false

  console.log('🔧 useSwapTx enabled conditions:', {
    hasChainId: !!chainId,
    hasFromAddress: !!from?.address,
    hasFromDecimals: from?.decimals !== undefined,
    hasFromAmount: !!from?.amount,
    hasToAddress: !!to?.address,
    hasToDecimals: to?.decimals !== undefined,
    addressesDifferent: from?.address && to?.address ? lower(from.address) !== lower(to.address) : false,
    hasUserAddress: !!userAddress,
    hasPublicClient: !!publicClient,
    hasSlippage: slippage !== undefined,
    optionsEnabled: options?.enabled !== false,
    enabled,
    chainId,
    fromAddress: from?.address,
    toAddress: to?.address,
    userAddress,
    slippage
  })

  const queryKey = [
    'swapTx',
    chainId,
    from?.address,
    from?.decimals,
    from?.amount.toString(),
    to?.address,
    to?.decimals,
    userAddress,
    slippage
  ]

  console.log('🔧 useSwapTx called with:', {
    chainId,
    fromAddress: from?.address,
    fromDecimals: from?.decimals,
    fromAmount: from?.amount?.toString(),
    toAddress: to?.address,
    toDecimals: to?.decimals,
    userAddress,
    slippage,
    enabled,
    isFirstSwapNecessary: options?.enabled
  })

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('🔧 useSwapTx queryFn executing...')
      if (!!publicClient) {
        const baseApiUrl = 'https://api.paraswap.io'
        const partner = 'saven'

        const pricesApiUrl = new URL(`${baseApiUrl}/prices`)
        pricesApiUrl.searchParams.set('srcToken', from.address)
        pricesApiUrl.searchParams.set('srcDecimals', from.decimals.toString())
        pricesApiUrl.searchParams.set('destToken', to.address)
        pricesApiUrl.searchParams.set('destDecimals', to.decimals.toString())
        pricesApiUrl.searchParams.set('amount', from.amount.toString())
        pricesApiUrl.searchParams.set('side', 'SELL')
        pricesApiUrl.searchParams.set('network', chainId.toString())
        pricesApiUrl.searchParams.set('userAddress', userAddress)
        pricesApiUrl.searchParams.set('partner', partner)
        pricesApiUrl.searchParams.set('version', '6.2')
        pricesApiUrl.searchParams.set('excludeDEXS', 'ParaSwapPool,ParaSwapLimitOrders')

        console.log('🔧 ParaSwap prices API call:', pricesApiUrl.toString())
        console.log('🔧 Requested amount (raw):', from.amount.toString())
        console.log('🔧 Requested amount (formatted):', (Number(from.amount) / Math.pow(10, from.decimals)).toFixed(6))
        console.log('🔧 User address:', userAddress)
        console.log('🔧 Token address:', from.address)

        const pricesApiResponse: ParaSwapPricesResponse = await fetch(pricesApiUrl.toString(), {
          method: 'get'
        })
          .then(async (r) => {
            console.log('🔧 ParaSwap prices API response status:', r.status)
            const responseText = await r.text()
            console.log('🔧 ParaSwap prices API response text:', responseText.substring(0, 1000))

            if (!r.ok) {
              console.error('🚨 ParaSwap prices API error details:', {
                status: r.status,
                statusText: r.statusText,
                response: responseText,
                url: pricesApiUrl.toString()
              })
              throw new Error(`ParaSwap prices API error: ${r.status} ${r.statusText} - ${responseText}`)
            }
            return responseText
          })
          .then((t) => {
            return JSON.parse(t)
          })
          .catch((error) => {
            console.error('🚨 ParaSwap prices API error:', error)
            throw error
          })

        if (!!pricesApiResponse?.priceRoute) {
          console.log('🔧 ParaSwap price route found, getting transaction data...')
          console.log('🔧 ParaSwap price route details:', {
            tokenTransferProxy: pricesApiResponse.priceRoute.tokenTransferProxy,
            contractAddress: pricesApiResponse.priceRoute.contractAddress,
            contractMethod: pricesApiResponse.priceRoute.contractMethod,
            partner: pricesApiResponse.priceRoute.partner,
            version: pricesApiResponse.priceRoute.version
          })

          const txApiUrl = new URL(`${baseApiUrl}/transactions/${chainId}`)
          // Temporarily remove ignoreChecks to see if it's causing the error
          // txApiUrl.searchParams.set('ignoreChecks', 'true')
          txApiUrl.searchParams.set('ignoreGasEstimate', 'true')

          const txApiRequestBody: ParaSwapTxRequestBody = {
            srcToken: from.address,
            srcDecimals: from.decimals,
            srcAmount: from.amount.toString(),
            destToken: to.address,
            destDecimals: to.decimals,
            slippage,
            userAddress,
            partner,
            priceRoute: pricesApiResponse.priceRoute
          }

          console.log('🔧 Transaction request amount (raw):', from.amount.toString())
          console.log('🔧 Transaction request amount (formatted):', (Number(from.amount) / Math.pow(10, from.decimals)).toFixed(6))
          console.log('🔧 Transaction request srcAmount:', txApiRequestBody.srcAmount)
          console.log('🔧 Transaction request srcDecimals:', txApiRequestBody.srcDecimals)

          console.log('🔧 ParaSwap transaction API call:', txApiUrl.toString())
          console.log('🔧 ParaSwap transaction request body:', txApiRequestBody)

          const txApiResponse: ParaSwapTxResponse = await fetch(txApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(txApiRequestBody)
          })
            .then(async (r) => {
              console.log('🔧 ParaSwap transaction API response status:', r.status)
              const responseText = await r.text()
              console.log('🔧 ParaSwap transaction API response text:', responseText.substring(0, 1000))

              if (!r.ok) {
                console.error('🚨 ParaSwap transaction API error details:', {
                  status: r.status,
                  statusText: r.statusText,
                  response: responseText,
                  requestBody: txApiRequestBody,
                  url: txApiUrl.toString()
                })
                throw new Error(`ParaSwap transaction API error: ${r.status} ${r.statusText} - ${responseText}`)
              }
              return responseText
            })
            .then((t) => {
              return JSON.parse(t)
            })
            .catch((error) => {
              console.error('🚨 ParaSwap transaction API error:', error)
              throw error
            })

          const tx: SwapTx = {
            target: txApiResponse.to,
            value: BigInt(txApiResponse.value),
            data: txApiResponse.data
          }

          const expectedAmountOut = BigInt(pricesApiResponse.priceRoute.destAmount)
          const minAmountOut = calculatePercentageOfBigInt(expectedAmountOut, 1 - slippage / 1e4)
          const amountOut = { expected: expectedAmountOut, min: minAmountOut }

          // Get token transfer proxy from API response, with fallback for malformed addresses
          let allowanceProxy = pricesApiResponse.priceRoute.tokenTransferProxy

          // Check if the allowanceProxy is malformed (too long or contains invalid characters)
          if (!allowanceProxy || allowanceProxy.length !== 42 || !allowanceProxy.startsWith('0x') ||
            /[^0-9a-fA-F]/.test(allowanceProxy.slice(2))) {
            console.warn('🚨 Malformed tokenTransferProxy from ParaSwap API:', allowanceProxy)

            // Use known ParaSwap Augustus Swapper as fallback for Base network
            if (chainId === 8453) { // Base network
              allowanceProxy = '0x59C7C832e96D2568bea6db468C1aAdcbbDa08A52'
              console.log('🔧 Using fallback allowanceProxy for Base:', allowanceProxy)
            } else {
              // For other networks, use the contract address as fallback
              allowanceProxy = pricesApiResponse.priceRoute.contractAddress
              console.log('🔧 Using contract address as fallback allowanceProxy:', allowanceProxy)
            }
          }

          console.log('🔧 Swap transaction details:', {
            target: tx.target,
            value: tx.value.toString(),
            dataLength: tx.data.length,
            allowanceProxy,
            expectedAmountOut: expectedAmountOut.toString(),
            minAmountOut: minAmountOut.toString()
          })

          return { tx, amountOut, allowanceProxy }
        } else {
          console.error('🚨 ParaSwap no price route found:', {
            error: pricesApiResponse?.error,
            priceRoute: pricesApiResponse?.priceRoute,
            chainId,
            fromAddress: from.address,
            toAddress: to.address,
            amount: from.amount.toString()
          })
          throw new Error(pricesApiResponse?.error || 'No price route found')
        }
      }
    },
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false

      if (error.message.startsWith('No routes found')) {
        console.error(`"${error.message}" (${chainId} - ${from.address} -> ${to.address})`)
        return false
      }

      return true
    },
    enabled,
    refetchInterval: sToMs(30)
  })

  console.log('🔧 useSwapTx result:', {
    data: !!result.data,
    isFetched: result.isFetched,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error?.message,
    enabled
  })

  // Debug ParaSwap beneficiary to ensure it's sending to zap router
  if (result.data) {
    console.log('🔍 ParaSwap beneficiary check:', {
      hasData: !!result.data,
      txData: result.data.tx?.data,
      dataLength: result.data.tx?.data?.length,
      dataPreview: result.data.tx?.data?.substring(0, 100) + '...',
      // The beneficiary should be the zap router address
      expectedBeneficiary: '0x6F19Da51d488926C007B9eBaa5968291a2eC6a63'
    })

    // Debug ParaSwap call parameters
    console.log('🔍 ParaSwap call parameters:', {
      chainId: chainId,
      partner: 'saven',
      ignoreChecks: 'true',
      note: 'Check if ParaSwap call parameters are correct'
    })
  }

  return result
}
