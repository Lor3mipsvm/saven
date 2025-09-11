import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useBeefyVault,
    useSelectedVaults,
    useToken,
    useTokenBalance,
    useUserVaultShareBalance,
    useVaultExchangeRate,
    useVaultTokenData,
    useAccount
} from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Address, formatUnits, parseUnits } from 'viem'
import { useZapTokenOptions } from '@/lib/hooks/useZapTokenOptions'
import {
    depositFormTokenAddressAtom,
    depositFormTokenAmountAtom,
    depositFormShareAmountAtom,
    depositZapPriceImpactAtom,
    depositZapMinReceivedAtom
} from '@/lib/atoms/depositAtoms'

// Atoms moved to @/lib/atoms/depositAtoms.ts

export interface DepositFormProps {
    vault: Vault
    showInputInfoRows?: boolean
}

export const DepositForm = (props: DepositFormProps) => {
    const { vault, showInputInfoRows } = props

    const { address: userAddress } = useAccount()

    // Parent now guarantees wallet and vault are available

    try {

        // ✅ get the underlying token data from the correct hook
        const { data: vaultToken, isFetched: isVaultTokenFetched, error: vaultTokenError } = useVaultTokenData(vault)
        const vaultTokenAddress = vaultToken?.address

        // Debug vault token data loading
        console.log('🔍 useVaultTokenData debug:', {
            vaultAddress: vault?.address,
            vaultToken,
            isVaultTokenFetched,
            vaultTokenError,
            vaultTokenAddress
        })

        // Jotai atom for manual overrides (zap)
        const [formTokenAddress, setFormTokenAddress] = useAtom(depositFormTokenAddressAtom)
        const tokenAddress = formTokenAddress ?? vaultTokenAddress

        // stable fallback to keep hooks order: use vault address until we learn the actual input token
        const effectiveTokenAddress = (tokenAddress ?? vault.address) as Address
        const isTokenResolved = true // Always show the form, don't wait for token data


        // from here on, it's safe to call hooks that require userAddress/tokenAddress
        const { data: vaultExchangeRate } = useVaultExchangeRate(vault)

        // Temporarily comment out to avoid potential API blocking
        // const { data: share } = useVaultSharePrice(vault)

        // Create fallback share data to avoid breaking the form
        const share = {
            symbol: 'SHARE',
            decimals: 18,
            price: 0
        }

        const selected = useSelectedVaults()

        const inputVault = useMemo(() => {
            if (!vault || !tokenAddress) return undefined
            const map = selected?.vaults ?? {}
            return Object.values(map).find(
                (v) =>
                    v.chainId === vault.chainId &&
                    v.address.toLowerCase() === tokenAddress.toLowerCase()
            )
        }, [vault?.chainId, tokenAddress, selected?.vaults])

        const shareLogoURI = useMemo(() => {
            if (!vault) return undefined
            const allInfo = selected?.allVaultInfo ?? []
            return (
                vault.logoURI ??
                allInfo.find(
                    (v) =>
                        v.chainId === vault.chainId &&
                        v.address.toLowerCase() === vault.address.toLowerCase()
                )?.logoURI
            )
        }, [vault?.chainId, vault?.address, vault?.logoURI, selected?.allVaultInfo])

        // keep this only AFTER tokenAddress exists (you already early-return above)
        const { data: tokenData, isFetched: isTokenDataFetched, error: tokenDataError } = useToken(vault.chainId, effectiveTokenAddress)

        // Debug token data loading
        console.log('🔍 useToken debug:', {
            chainId: vault.chainId,
            effectiveTokenAddress,
            tokenData,
            isTokenDataFetched,
            tokenDataError
        })

        // Skip token prices for now to avoid CORS issues - this will be resolved later
        // const { data: tokenPrices } = useTokenPrices(vault.chainId, [effectiveTokenAddress])

        // remove: useVaultSharePrice(inputVault!)  ❌
        // remove: the earlier duplicate useTokenBalance(...) named vaultTokenWithAmount ❌

        const token =
            tokenAddress && tokenData
                ? {
                    logoURI:
                        vaultToken && tokenAddress.toLowerCase() === vaultToken.address.toLowerCase()
                            ? vault.tokenLogoURI
                            : inputVault?.logoURI,
                    ...tokenData,
                    // Set price to 0 for now to avoid CORS issues
                    price: 0
                }
                : undefined

        const { data: tokenWithAmount, isFetched: isFetchedTokenBalance } = useTokenBalance(
            vault.chainId,
            userAddress!,
            effectiveTokenAddress,
            { refetchOnWindowFocus: true }
        )
        const tokenBalance = isFetchedTokenBalance && !!tokenWithAmount ? tokenWithAmount.amount : 0n

        // Debug logging - let's diagnose the actual problem
        console.log('🔍 DepositForm Diagnosis:', {
            // Vault info
            vault: {
                address: vault?.address,
                chainId: vault?.chainId,
                name: vault?.name
            },
            // Vault token data
            vaultToken: {
                address: vaultToken?.address,
                symbol: vaultToken?.symbol,
                decimals: vaultToken?.decimals
            },
            // Token address resolution
            tokenAddressResolution: {
                vaultTokenAddress,
                formTokenAddress,
                finalTokenAddress: tokenAddress,
                effectiveTokenAddress
            },
            // Token data from useToken hook
            tokenData: {
                symbol: tokenData?.symbol,
                name: tokenData?.name,
                decimals: tokenData?.decimals,
                address: tokenData?.address
            },
            // Final token object
            token: {
                symbol: token?.symbol,
                decimals: token?.decimals,
                address: token?.address
            },
            // Balance data
            balance: {
                tokenBalance: tokenBalance.toString(),
                isFetchedTokenBalance,
                tokenWithAmount: tokenWithAmount?.amount?.toString()
            },
            // Exchange rate
            vaultExchangeRate: vaultExchangeRate?.toString(),
            // Form state
            isTokenResolved
        })

        const { data: shareWithAmount, isFetched: isFetchedShareWithAmount } = useUserVaultShareBalance(
            vault,
            userAddress!
        )
        const shareBalance = isFetchedShareWithAmount && !!shareWithAmount ? shareWithAmount.amount : 0n

        const formMethods = useForm({
            mode: 'onChange',
            defaultValues: { tokenAmount: '', shareAmount: '' }
        })

        const [formTokenAmount, setFormTokenAmount] = useAtom(depositFormTokenAmountAtom)
        const [formShareAmount, setFormShareAmount] = useAtom(depositFormShareAmountAtom)

        const [priceImpact, setPriceImpact] = useAtom(depositZapPriceImpactAtom)
        const setMinReceived = useSetAtom(depositZapMinReceivedAtom)

        // Zap preview state removed

        // and update your initial effect to follow the actual address:
        useEffect(() => {
            if (vaultTokenAddress && formTokenAddress !== vaultTokenAddress) {
                setFormTokenAddress(vaultTokenAddress)
                setFormTokenAmount('')
                setFormShareAmount('')
                setPriceImpact(undefined)
                setMinReceived(undefined)
                formMethods.reset()
            }
        }, [vaultTokenAddress])  // ✅ depend on the thing you read

        const depositAmount = useMemo(() => {
            return !!formTokenAmount && token?.decimals !== undefined
                ? parseUnits(formTokenAmount, token.decimals)
                : 0n
        }, [formTokenAmount, token])

        // Zap preview hook removed to prevent crashes on first mount

        const isZapping =
            !!vaultToken && !!formTokenAddress && vaultToken.address.toLowerCase() !== formTokenAddress.toLowerCase()
        const isZappingAndSwapping = false  // no preview for now

        const vaultDecimals =
            vault.decimals ??
            vaultToken?.decimals ??
            share?.decimals ??
            shareWithAmount?.decimals

        // Zap preview effects removed to prevent crashes

        const handleTokenAmountChange = (tokenAmount: string) => {
            if (!!vaultExchangeRate && token?.decimals !== undefined && share?.decimals !== undefined) {
                if (isValidFormInput(tokenAmount, token.decimals)) {
                    setFormTokenAmount(tokenAmount)

                    if (!isZapping) {
                        const tokens = parseUnits(tokenAmount, token.decimals)
                        const shares = getSharesFromAssets(tokens, vaultExchangeRate, share.decimals)
                        const formattedShares = formatUnits(shares, share.decimals)
                        const slicedShares = formattedShares.endsWith('.0')
                            ? formattedShares.slice(0, -2)
                            : formattedShares

                        setFormShareAmount(slicedShares)
                        formMethods.setValue('shareAmount', slicedShares, { shouldValidate: true })
                    }
                } else {
                    setFormTokenAmount('0')
                }
            }
        }

        // Removed problematic useEffect that was causing infinite loop

        const handleShareAmountChange = (shareAmount: string) => {
            if (
                !isZapping &&
                !!vaultExchangeRate &&
                token?.decimals !== undefined &&
                share?.decimals !== undefined
            ) {
                if (isValidFormInput(shareAmount, share.decimals)) {
                    setFormShareAmount(shareAmount)

                    const shares = parseUnits(shareAmount, share.decimals)
                    const tokens = getAssetsFromShares(shares, vaultExchangeRate, share.decimals)
                    const formattedTokens = formatUnits(tokens, token.decimals)
                    const slicedTokens = formattedTokens.endsWith('.0')
                        ? formattedTokens.slice(0, -2)
                        : formattedTokens

                    setFormTokenAmount(slicedTokens)
                    formMethods.setValue('tokenAmount', slicedTokens, { shouldValidate: true })
                } else {
                    setFormTokenAmount('0')
                }
            }
        }

        const tokenInputData = useMemo(() => {
            if (!!token) {
                return {
                    ...token,
                    amount: tokenBalance,
                    price: token.price ?? 0
                }
            }
        }, [token, tokenBalance])

        const shareInputData = useMemo(() => {
            if (!!share) {
                return {
                    ...share,
                    amount: shareBalance,
                    price: share.price ?? 0,
                    logoURI: shareLogoURI ?? vault.tokenLogoURI
                }
            }
        }, [vault, share, shareBalance, shareLogoURI])

        const zapTokenOptions = useZapTokenOptions(vault.chainId, {
            includeNativeAsset: true,
            includeVaultsWithBalance: true,
            includeBeefyVault: true
        })

        // Zap preview price impact effect removed

        return (
            <div className="flex flex-col isolate">
                <FormProvider {...formMethods}>
                    <Card className="p-6 mb-2 bg-slate-800/50 border-slate-700">
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-slate-200 mb-2 block">Token Amount</label>
                                {!isTokenResolved && (
                                    <div className="text-xs text-slate-400 mb-2">Loading token details…</div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={formTokenAmount}
                                        onChange={(e) => handleTokenAmountChange(e.target.value)}
                                        placeholder="0.0"
                                        className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (token && tokenBalance > 0n) {
                                                const maxAmount = formatUnits(tokenBalance, token.decimals)
                                                handleTokenAmountChange(maxAmount)
                                            } else if (tokenInputData) {
                                                const maxAmount = formatUnits(tokenInputData.amount, tokenInputData.decimals)
                                                handleTokenAmountChange(maxAmount)
                                            }
                                        }}
                                        disabled={!token || tokenBalance === 0n}
                                        className="border-amber-500 text-amber-400 hover:bg-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        MAX
                                    </Button>
                                </div>
                                {tokenInputData && (
                                    <div className="text-xs text-slate-400 mt-2">
                                        Balance: {formatUnits(tokenInputData.amount, tokenInputData.decimals)} {tokenInputData.symbol}
                                    </div>
                                )}
                            </div>


                            {isZappingAndSwapping && !!depositAmount && (
                                <div className="flex flex-col p-4 bg-slate-700/30 rounded-lg text-xs text-slate-300 space-y-3">
                                    <div className="flex gap-2 items-center">
                                        <span className="font-semibold text-slate-200">Price Impact</span>
                                        <div className="h-3 grow border-b border-dashed border-slate-500" />
                                        {priceImpact !== undefined ? (
                                            <span className={`font-medium ${priceImpact > 5 ? 'text-red-400' : 'text-amber-400'}`}>
                                                {`${priceImpact > 0 ? '+' : ''}${priceImpact.toFixed(2)}%`}
                                            </span>
                                        ) : (
                                            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                        )}
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <span className="font-semibold text-slate-200">Minimum Received</span>
                                        <div className="h-3 grow border-b border-dashed border-slate-500" />
                                        <span className="text-slate-400 font-medium">
                                            Preview disabled
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </FormProvider>
            </div>
        )
    } catch (e) {
        console.error('DepositForm hard error:', e)
        throw e
    }
}

// Helper functions
const isValidFormInput = (value: string, decimals: number): boolean => {
    if (!value || value === '') return false
    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`)
    return regex.test(value) && parseFloat(value) > 0
}

const getSharesFromAssets = (assets: bigint, exchangeRate: bigint, decimals: number): bigint => {
    return (assets * (10n ** BigInt(decimals))) / exchangeRate
}

const getAssetsFromShares = (shares: bigint, exchangeRate: bigint, decimals: number): bigint => {
    return (shares * exchangeRate) / (10n ** BigInt(decimals))
}
