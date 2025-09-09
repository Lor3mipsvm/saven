'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@saven/ui'
import { useVaultData, useVaultTVL, useVaultBalance, usePrizePoolData, useRealVaultAPR } from '@/lib/vault-hooks'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { formatEther } from 'viem'

interface VaultCardProps {
    vaultAddress: string
    vaultName: string
    vaultSymbol: string
    vaultDescription?: string
    vaultLogo?: string
    apr?: number
}

export function VaultCard({
    vaultAddress,
    vaultName,
    vaultSymbol,
    vaultDescription,
    vaultLogo,
    apr
}: VaultCardProps) {
    // Early return if vaultAddress is invalid
    if (!vaultAddress) {
        return null
    }

    // Dynamic wallet integration (with fallback)
    const dynamicContext = useDynamicContext()
    const user = dynamicContext?.user || null
    const primaryWallet = dynamicContext?.primaryWallet || null
    const walletAddress = primaryWallet?.address || null
    const isLoggedIn = !!user && !!primaryWallet

    const { vault, isLoading: vaultLoading } = useVaultData(vaultAddress)
    const { tvl, isLoading: tvlLoading } = useVaultTVL(vaultAddress)
    const { balance, isLoading: balanceLoading } = useVaultBalance(vaultAddress, walletAddress)
    const { totalSupply, prizeOdds, isLoading: prizeLoading } = usePrizePoolData(vaultAddress)
    const { nativeAPR, prizeYield, promotionAPR, totalAPR, isLoading: aprLoading } = useRealVaultAPR(vaultAddress)

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(2)}K`
        } else {
            return `$${value.toFixed(2)}`
        }
    }

    const formatPercentage = (value: number) => {
        return `${value.toFixed(4)}%`
    }

    return (
        <Card className="w-full max-w-md mx-auto bg-slate-800/10 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    {vaultLogo && (
                        <img
                            src={vaultLogo}
                            alt={`${vaultName} logo`}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <div>
                        <CardTitle className="text-slate-100 text-lg">{vaultName}</CardTitle>
                        <CardDescription className="text-slate-400">
                            {vaultSymbol} • Base Network
                        </CardDescription>
                    </div>
                </div>
                {vaultDescription && (
                    <p className="text-slate-300 text-sm mt-2">{vaultDescription}</p>
                )}
                {/* Yield Source Badge */}
                {vault.extensions?.yieldSource?.name && (
                    <Badge variant="outline" className="mt-2 border-slate-600 text-slate-400 text-xs">
                        {vault.extensions.yieldSource.name}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* TVL Display */}
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Value Locked</span>
                    <span className="text-slate-100 font-semibold">
                        {tvlLoading ? 'Loading...' : formatCurrency(tvl)}
                    </span>
                </div>

                {/* Vault APR Display */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Vault APR</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                            {apr ? `${apr.toFixed(2)}%` : (aprLoading ? 'Loading...' : `${totalAPR.toFixed(2)}%`)}
                        </Badge>
                    </div>

                    {/* APR Breakdown */}
                    <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                            <span>Native APR ({vault?.extensions?.yieldSource?.name || 'Strategy'})</span>
                            <span>{aprLoading ? '...' : `${nativeAPR.toFixed(2)}%`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Prize Yield (PoolTogether)</span>
                            <span>{aprLoading ? '...' : `${prizeYield.toFixed(2)}%`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Promotion APR (PoolTogether)</span>
                            <span>{aprLoading ? '...' : `${promotionAPR.toFixed(2)}%`}</span>
                        </div>
                    </div>
                </div>

                {/* Prize Odds */}
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Prize Odds</span>
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                        {prizeLoading ? 'Loading...' : formatPercentage(prizeOdds)}
                    </Badge>
                </div>

                {/* User Balance - now available with Dynamic */}
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Your Balance</span>
                    <span className="text-slate-100 font-semibold">
                        {!isLoggedIn ? 'Connect wallet' : balanceLoading ? 'Loading...' : `${balance.toFixed(4)} ${vaultSymbol}`}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0"
                        disabled={!isLoggedIn} // Enable when wallet is connected
                    >
                        Deposit
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        disabled={!isLoggedIn || balance === 0} // Enable when wallet is connected and has balance
                    >
                        Withdraw
                    </Button>
                </div>

                {/* Connection Status */}
                <p className="text-slate-500 text-xs text-center pt-2">
                    {!isLoggedIn ? 'Connect your wallet to interact with vaults' : 'Ready to deposit and withdraw'}
                </p>
            </CardContent>
        </Card>
    )
}
