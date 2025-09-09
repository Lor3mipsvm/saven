import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useBeefyVault,
    useSelectedVaults,
    useSendDepositZapTransaction,
    useToken,
    useTokenBalance,
    useTokenPrices,
    useUserVaultShareBalance,
    useVaultExchangeRate,
    useVaultSharePrice,
    useVaultTokenPrice,
    useAccount
} from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Address, formatUnits, parseUnits } from 'viem'
import { useZapTokenOptions } from '@/lib/hooks/useZapTokenOptions'

export const depositFormTokenAddressAtom = atom<Address | undefined>(undefined)
export const depositFormTokenAmountAtom = atom<string>('')
export const depositFormShareAmountAtom = atom<string>('')
export const depositZapPriceImpactAtom = atom<number | undefined>(undefined)
export const depositZapMinReceivedAtom = atom<bigint | undefined>(undefined)

export interface DepositFormProps {
    vault: Vault
    showInputInfoRows?: boolean
}

export const DepositForm = (props: DepositFormProps) => {
    const { vault, showInputInfoRows } = props

    const { address: userAddress } = useAccount()

    const { data: vaultExchangeRate } = useVaultExchangeRate(vault)
    const { data: vaultToken } = useVaultTokenPrice(vault)
    const { data: vaultTokenWithAmount } = useTokenBalance(
        vault.chainId,
        userAddress!,
        vaultToken?.address!,
        { refetchOnWindowFocus: true }
    )

    const { data: share } = useVaultSharePrice(vault)

    const [formTokenAddress, setFormTokenAddress] = useAtom(depositFormTokenAddressAtom)
    const tokenAddress = formTokenAddress ?? vaultToken?.address

    const { vaults } = useSelectedVaults()

    const inputVault = useMemo(() => {
        if (!!vault && !!tokenAddress) {
            return Object.values(vaults.vaults).find((v) => v.chainId === vault.chainId && v.address === tokenAddress)
        }
    }, [vault, tokenAddress, vaults])

    const shareLogoURI = useMemo(() => {
        if (!!vault) {
            return vault.logoURI ?? vaults.allVaultInfo.find((v) => v.chainId === vault.chainId && v.address === vault.address)?.logoURI
        }
    }, [vault, vaults])

    const { data: tokenData } = useToken(vault.chainId, tokenAddress!)
    const { data: tokenPrices } = useTokenPrices(vault.chainId, !!tokenAddress ? [tokenAddress] : [])
    const { data: inputVaultWithPrice } = useVaultSharePrice(inputVault!)
    const { data: beefyVault } = useBeefyVault(vault)
    const { data: underlyingBeefyTokenPrices } = useTokenPrices(
        vault.chainId,
        !!beefyVault ? [beefyVault.want] : []
    )

    const token: any = !!tokenAddress && (!!tokenData || !!inputVaultWithPrice)
        ? {
            logoURI: !!vaultToken && tokenAddress.toLowerCase() === vaultToken.address.toLowerCase()
                ? vault.tokenLogoURI
                : inputVault?.logoURI,
            ...tokenData!,
            ...inputVaultWithPrice!,
            ...(!!beefyVault && tokenAddress.toLowerCase() === beefyVault.address.toLowerCase() ? beefyVault : {}),
            price: tokenPrices?.[tokenAddress.toLowerCase()] ??
                inputVaultWithPrice?.price ??
                (!!beefyVault &&
                    !!underlyingBeefyTokenPrices &&
                    tokenAddress.toLowerCase() === beefyVault.address.toLowerCase()
                    ? (underlyingBeefyTokenPrices?.[beefyVault.want.toLowerCase()] ?? 0) *
                    parseFloat(formatUnits(beefyVault.pricePerFullShare, 18))
                    : undefined)
        }
        : undefined

    const { data: tokenWithAmount, isFetched: isFetchedTokenBalance } = useTokenBalance(
        vault.chainId,
        userAddress!,
        tokenAddress!,
        { refetchOnWindowFocus: true }
    )
    const tokenBalance = isFetchedTokenBalance && !!tokenWithAmount ? tokenWithAmount.amount : 0n

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
    const setFormShareAmount = useSetAtom(depositFormShareAmountAtom)

    const [priceImpact, setPriceImpact] = useAtom(depositZapPriceImpactAtom)
    const setMinReceived = useSetAtom(depositZapMinReceivedAtom)

    const [cachedZapAmountOut, setCachedZapAmountOut] =
        useState<ReturnType<typeof useSendDepositZapTransaction>['amountOut']>()

    useEffect(() => {
        setFormTokenAddress(vaultToken?.address)
        setFormTokenAmount('')
        setFormShareAmount('')
        setPriceImpact(undefined)
        setMinReceived(undefined)
        setCachedZapAmountOut(undefined)
        formMethods.reset()
    }, [])

    const depositAmount = useMemo(() => {
        return !!formTokenAmount && token?.decimals !== undefined
            ? parseUnits(formTokenAmount, token.decimals)
            : 0n
    }, [formTokenAmount, token])

    const { amountOut: zapAmountOut, isFetchingZapArgs } = useSendDepositZapTransaction(
        { address: token?.address!, decimals: token?.decimals!, amount: depositAmount },
        vault
    )

    const isZapping =
        !!vaultToken && !!formTokenAddress && vaultToken.address.toLowerCase() !== formTokenAddress.toLowerCase()
    const isZappingAndSwapping =
        isZapping && !!cachedZapAmountOut && cachedZapAmountOut.expected !== cachedZapAmountOut.min

    const vaultDecimals =
        vault.decimals ??
        vaultToken?.decimals ??
        vaultTokenWithAmount?.decimals ??
        share?.decimals ??
        shareWithAmount?.decimals

    useEffect(() => {
        if (
            isZapping &&
            !!zapAmountOut?.expected &&
            !!zapAmountOut.min &&
            (cachedZapAmountOut?.expected !== zapAmountOut.expected ||
                cachedZapAmountOut?.min !== zapAmountOut.min)
        ) {
            setCachedZapAmountOut(zapAmountOut)
        }
    }, [isZapping, zapAmountOut]) // Removed cachedZapAmountOut from deps to prevent infinite loop

    useEffect(() => {
        if (isZapping && !!cachedZapAmountOut && vaultDecimals !== undefined) {
            const formattedShares = formatUnits(cachedZapAmountOut.expected, vaultDecimals)
            const slicedShares = formattedShares.endsWith('.0')
                ? formattedShares.slice(0, -2)
                : formattedShares

            setFormShareAmount(slicedShares)
            formMethods.setValue('shareAmount', slicedShares, { shouldValidate: true })
        }
    }, [cachedZapAmountOut, isZapping, vaultDecimals]) // Removed formMethods from deps

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

    useEffect(() => {
        if (
            isZappingAndSwapping &&
            !!zapAmountOut &&
            tokenInputData?.decimals !== undefined &&
            shareInputData?.decimals !== undefined
        ) {
            const inputValue =
                parseFloat(formatUnits(depositAmount, tokenInputData.decimals)) * tokenInputData.price
            const outputValue =
                parseFloat(formatUnits(zapAmountOut.expected, shareInputData.decimals)) *
                shareInputData.price

            if (!!inputValue && !!outputValue) {
                setPriceImpact((1 - inputValue / outputValue) * 100)
            } else {
                setPriceImpact(undefined)
            }

            setMinReceived(zapAmountOut.min)
        } else {
            setPriceImpact(undefined)
            setMinReceived(undefined)
        }
    }, [depositAmount, zapAmountOut, tokenInputData, shareInputData])

    return (
        <div className="flex flex-col isolate">
            <FormProvider {...formMethods}>
                <Card className="p-6 mb-2 bg-slate-800/50 border-slate-700">
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-200 mb-2 block">Token Amount</label>
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
                                        if (tokenInputData) {
                                            const maxAmount = formatUnits(tokenInputData.amount, tokenInputData.decimals)
                                            handleTokenAmountChange(maxAmount)
                                        }
                                    }}
                                    className="border-amber-500 text-amber-400 hover:bg-amber-500/10"
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

                        <Separator className="bg-slate-600" />

                        <div>
                            <label className="text-sm font-medium text-slate-200 mb-2 block">Share Amount</label>
                            <Input
                                value={formShareAmount}
                                onChange={(e) => handleShareAmountChange(e.target.value)}
                                placeholder="0.0"
                                disabled={isZapping}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500 disabled:opacity-50"
                            />
                            {shareInputData && (
                                <div className="text-xs text-slate-400 mt-2">
                                    Balance: {formatUnits(shareInputData.amount, shareInputData.decimals)} {shareInputData.symbol}
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
                                    {!!zapAmountOut && !!shareInputData ? (
                                        <span className="text-amber-400 font-medium">
                                            {formatUnits(zapAmountOut.min, shareInputData.decimals)} {shareInputData.symbol}
                                        </span>
                                    ) : (
                                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </FormProvider>
        </div>
    )
}

// Helper functions
const isValidFormInput = (value: string, decimals: number): boolean => {
    if (!value || value === '') return false
    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`)
    return regex.test(value) && parseFloat(value) > 0
}

const getSharesFromAssets = (assets: bigint, exchangeRate: bigint, decimals: number): bigint => {
    return (assets * BigInt(10 ** decimals)) / exchangeRate
}

const getAssetsFromShares = (shares: bigint, exchangeRate: bigint, decimals: number): bigint => {
    return (shares * exchangeRate) / BigInt(10 ** decimals)
}
