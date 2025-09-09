'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Chain, type Token, type Quote } from './lifi-client'
import {
    lifi,
    SUPPORTED_CHAINS,
    CHAIN_MAP,
    getSwapQuote,
    executeSwap,
    getSupportedTokens,
    formatTokenAmount,
    parseTokenAmount
} from './lifi-client'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useVaults } from '@/providers/VaultsProvider'

export interface UseLifiOptions {
    fromChainId?: number
    toChainId?: number
    fromTokenAddress?: string
    toTokenAddress?: string
    userAddress?: string
}

export interface SwapState {
    isLoading: boolean
    error: string | null
    quote: Quote | null
    tokens: Token[]
    balances: Record<string, string>
}

export function useLifi(options: UseLifiOptions = {}) {
    const { primaryWallet } = useDynamicContext()
    const userAddress = primaryWallet?.address
    const vaults = useVaults()

    const [state, setState] = useState<SwapState>({
        isLoading: false,
        error: null,
        quote: null,
        tokens: [],
        balances: {},
    })

    // Debug logging
    console.log('🔍 useLifi Debug:', {
        vaults: vaults ? 'Vaults object exists' : 'No vaults object',
        userAddress,
        primaryWallet: primaryWallet ? 'Connected' : 'Not connected'
    })

    const [selectedFromChain, setSelectedFromChain] = useState<Chain | null>(
        options.fromChainId ? CHAIN_MAP.get(options.fromChainId) || null : null
    )
    const [selectedToChain, setSelectedToChain] = useState<Chain | null>(
        options.toChainId ? CHAIN_MAP.get(options.toChainId) || null : null
    )
    const [selectedFromToken, setSelectedFromToken] = useState<Token | null>(null)
    const [selectedToToken, setSelectedToToken] = useState<Token | null>(null)

    // We'll fetch balances directly using the wallet provider instead of Dynamic's token balances
    // Dynamic's useTokenBalances has restrictions (min $10k liquidity, specific networks)
    // and doesn't work well with LI.FI's token list

    // Load supported tokens for selected chain
    const loadTokens = useCallback(async (chainId: number) => {
        console.log('🔄 Loading tokens for chain:', chainId)
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const tokens = await getSupportedTokens(chainId)
            // Ensure tokens is always an array
            const tokenArray = Array.isArray(tokens) ? tokens : []
            console.log('📋 Loaded tokens:', tokenArray.map(t => ({ symbol: t.symbol, address: t.address })))
            setState(prev => ({ ...prev, tokens: tokenArray, isLoading: false }))
        } catch (error) {
            console.error('Error loading tokens:', error)
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to load tokens',
                isLoading: false,
                tokens: [] // Ensure tokens is always an array even on error
            }))
        }
    }, [])


    // Load token balances using Dynamic's token balance functionality
    const loadTokenBalances = useCallback(async (chainId: number, tokens: Token[], userAddress: string) => {
        if (!tokens.length || !userAddress || !primaryWallet) return

        console.log('🔄 Loading token balances for', tokens.length, 'tokens using Dynamic wallet')
        const balances: Record<string, string> = {}

        for (const token of tokens) {
            try {
                let balance = '0'

                // Use Dynamic's wallet to get the actual token balance
                if (primaryWallet.connector) {
                    try {
                        // Get the balance directly from the wallet
                        const tokenBalance = await primaryWallet.connector.getBalance({
                            address: userAddress,
                            token: token.address,
                            chainId: chainId
                        })

                        if (tokenBalance) {
                            balance = tokenBalance.toString()
                        }
                    } catch (walletError) {
                        console.warn(`Failed to get balance from wallet for ${token.symbol}:`, walletError)

                        // Fallback: try to get balance using a direct contract call
                        try {
                            if (vaults && vaults.publicClients[chainId]) {
                                const client = vaults.publicClients[chainId]

                                // For ERC20 tokens, call balanceOf function
                                const balanceOfAbi = [
                                    {
                                        inputs: [{ name: 'account', type: 'address' }],
                                        name: 'balanceOf',
                                        outputs: [{ name: '', type: 'uint256' }],
                                        stateMutability: 'view',
                                        type: 'function'
                                    }
                                ] as const

                                const result = await client.readContract({
                                    address: token.address as `0x${string}`,
                                    abi: balanceOfAbi,
                                    functionName: 'balanceOf',
                                    args: [userAddress as `0x${string}`]
                                })

                                balance = result.toString()
                            }
                        } catch (contractError) {
                            console.warn(`Failed to get balance via contract call for ${token.symbol}:`, contractError)
                        }
                    }
                }

                const key = `${chainId}-${token.address}`
                balances[key] = balance
                console.log(`💰 Balance for ${token.symbol} (${token.address}): ${balance}`)
            } catch (error) {
                console.error(`Failed to fetch balance for ${token.symbol}:`, error)
                const key = `${chainId}-${token.address}`
                balances[key] = '0'
            }
        }

        console.log('💾 Setting balances in state:', balances)
        setState(prev => ({ ...prev, balances }))
    }, [primaryWallet, vaults])

    // Load balances when tokens or user address changes
    useEffect(() => {
        if (selectedFromChain && state.tokens.length > 0 && userAddress) {
            loadTokenBalances(selectedFromChain.id, state.tokens, userAddress)
        }
    }, [selectedFromChain, state.tokens, userAddress, loadTokenBalances])

    // Get swap quote
    const getQuote = useCallback(async (
        fromChainId: number,
        toChainId: number,
        fromTokenAddress: string,
        toTokenAddress: string,
        amount: string,
        fromAddress: string
    ) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const quote = await getSwapQuote(
                fromChainId,
                toChainId,
                fromTokenAddress,
                toTokenAddress,
                amount,
                fromAddress
            )

            setState(prev => ({ ...prev, quote, isLoading: false }))
            return quote
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to get quote',
                isLoading: false
            }))
            throw error
        }
    }, [])

    // Execute swap
    const executeSwapTransaction = useCallback(async (quote: Quote, signer: any) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const txHash = await executeSwap(quote, signer)
            setState(prev => ({ ...prev, isLoading: false }))
            return txHash
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to execute swap',
                isLoading: false
            }))
            throw error
        }
    }, [])

    // Load tokens when chain changes
    useEffect(() => {
        if (selectedFromChain) {
            loadTokens(selectedFromChain.id)
        }
    }, [selectedFromChain, loadTokens])

    // Dynamic handles balance loading automatically

    // Get formatted balance for a token (synchronous)
    const getFormattedBalance = useCallback((chainId: number, tokenAddress: string) => {
        const key = `${chainId}-${tokenAddress}`
        const balance = state.balances[key]
        console.log(`🔍 Looking for balance with key: ${key}`, { balance, allBalances: state.balances })

        if (!balance) {
            console.log(`❌ No balance found for ${tokenAddress}`)
            return '0'
        }

        const token = state.tokens.find(t => t.address === tokenAddress)
        if (!token) {
            console.log(`❌ No token found for address: ${tokenAddress}`)
            return '0'
        }

        const formattedBalance = formatTokenAmount(balance, token.decimals)
        console.log(`✅ Formatted balance for ${token.symbol}: ${formattedBalance}`)
        return formattedBalance
    }, [state.balances, state.tokens])


    // Check if user has sufficient balance
    const hasSufficientBalance = useCallback((chainId: number, tokenAddress: string, amount: string) => {
        const balance = state.balances[`${chainId}-${tokenAddress}`]
        if (!balance) return false

        const token = state.tokens.find(t => t.address === tokenAddress)
        if (!token) return false

        const parsedAmount = parseTokenAmount(amount, token.decimals)
        return BigInt(balance) >= BigInt(parsedAmount)
    }, [state.balances, state.tokens])

    return {
        // State
        ...state,
        selectedFromChain,
        selectedToChain,
        selectedFromToken,
        selectedToToken,

        // Supported chains
        supportedChains: SUPPORTED_CHAINS,

        // Actions
        setSelectedFromChain,
        setSelectedToChain,
        setSelectedFromToken,
        setSelectedToToken,
        getQuote,
        executeSwapTransaction,
        loadTokens,
        getFormattedBalance,
        hasSufficientBalance,

        // Utilities
        formatTokenAmount,
        parseTokenAmount,
    }
}

// Hook for managing zap operations specifically
export function useZap() {
    const [zapState, setZapState] = useState<{
        isZapping: boolean
        zapStep: 'select' | 'quote' | 'approve' | 'swap' | 'deposit' | 'complete'
        error: string | null
        txHashes: string[]
    }>({
        isZapping: false,
        zapStep: 'select',
        error: null,
        txHashes: [],
    })

    const startZap = useCallback(() => {
        setZapState({
            isZapping: true,
            zapStep: 'select',
            error: null,
            txHashes: [],
        })
    }, [])

    const updateZapStep = useCallback((step: typeof zapState.zapStep) => {
        setZapState(prev => ({ ...prev, zapStep: step }))
    }, [])

    const addTxHash = useCallback((txHash: string) => {
        setZapState(prev => ({
            ...prev,
            txHashes: [...prev.txHashes, txHash]
        }))
    }, [])

    const setZapError = useCallback((error: string) => {
        setZapState(prev => ({
            ...prev,
            error,
            isZapping: false
        }))
    }, [])

    const completeZap = useCallback(() => {
        setZapState(prev => ({
            ...prev,
            isZapping: false,
            zapStep: 'complete'
        }))
    }, [])

    const resetZap = useCallback(() => {
        setZapState({
            isZapping: false,
            zapStep: 'select',
            error: null,
            txHashes: [],
        })
    }, [])

    return {
        ...zapState,
        startZap,
        updateZapStep,
        addTxHash,
        setZapError,
        completeZap,
        resetZap,
    }
}
