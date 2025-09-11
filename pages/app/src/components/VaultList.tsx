'use client'

import { useVaultListData, useMultipleVaultAPRs } from '@/lib/vault-hooks'
import { VaultCard } from './VaultCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Skeleton } from '@saven/ui'
import { useState, useEffect, useMemo, useRef } from 'react'

interface VaultListProps {
    selectedExposureAsset?: string;
    onDeposit?: (vaultAddress: string) => void;
}

// Asset mapping configuration
const ASSET_MAPPING = {
    BTC: ['cbBTC', 'WBTC', 'LBTC', 'btc', 'wbtc', 'lbtc'],
    ETH: ['wstETH', 'rETH', 'msETH', 'WETH', 'CBETH', 'wsteth', 'reth', 'mseth', 'weth', 'cbeth'],
    USD: ['USDC', 'USDT', 'sUSDe', 'USDe', 'DAI', 'GHO', 'frxUSD', 'USDf', 'USDS', 'USD0', 'USD0++', 'USR', 'wstUSR', 'usdc', 'usdt', 'susde', 'usde', 'dai', 'gho', 'frxusd', 'usdf', 'usds', 'usd0', 'usr', 'wstusr']
} as const

// Function to map vault symbol to exposure asset
function mapVaultToExposureAsset(vault: any): string {
    const symbol = vault.extensions?.underlyingAsset?.symbol || vault.symbol || ''
    const symbolLower = symbol.toLowerCase()

    // Check BTC assets
    if (ASSET_MAPPING.BTC.some(asset => symbolLower.includes(asset.toLowerCase()))) {
        return 'BTC'
    }

    // Check ETH assets
    if (ASSET_MAPPING.ETH.some(asset => symbolLower.includes(asset.toLowerCase()))) {
        return 'ETH'
    }

    // Check USD assets
    if (ASSET_MAPPING.USD.some(asset => symbolLower.includes(asset.toLowerCase()))) {
        return 'USD'
    }

    // No fallback - return null for unmapped assets
    return null
}

// Cache for highest APR vault calculations (30 minutes)
const highestAPRCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export function VaultList({ selectedExposureAsset = 'ETH', onDeposit }: VaultListProps) {
    const { vaultLists, isLoading, error } = useVaultListData()
    const [highestAPRVault, setHighestAPRVault] = useState<any>(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const hasCalculated = useRef(false)

    // Get vaults from the vault lists with defensive checks
    const allVaults = vaultLists && typeof vaultLists === 'object'
        ? Object.values(vaultLists).flatMap((vaultList: any) => vaultList?.tokens || [])
        : []

    // Filter vaults by selected exposure asset
    const vaults = useMemo(() => {
        const filteredVaults = allVaults.filter(vault => {
            const vaultExposureAsset = mapVaultToExposureAsset(vault)
            return vaultExposureAsset === selectedExposureAsset
        })

        // Debug logging
        console.log(`Vault filtering for ${selectedExposureAsset}:`, {
            totalVaults: allVaults.length,
            filteredVaults: filteredVaults.length,
            allVaultMappings: allVaults.map(v => ({
                symbol: v.symbol,
                underlyingSymbol: v.extensions?.underlyingAsset?.symbol,
                mappedAsset: mapVaultToExposureAsset(v)
            }))
        })

        return filteredVaults
    }, [allVaults, selectedExposureAsset])

    // Get vault addresses for APR fetching
    const vaultAddresses = useMemo(() =>
        vaults.map(v => v.address),
        [vaults]
    )

    // Fetch real APR data for all vaults
    const { vaultAPRs, isLoading: aprLoading, error: aprError } = useMultipleVaultAPRs(vaultAddresses)

    // Create a stable vault key for caching
    const vaultKey = useMemo(() => {
        return vaults.map(v => v.address).sort().join('-')
    }, [vaults])

    // Reset calculation when exposure asset changes
    useEffect(() => {
        hasCalculated.current = false
        setIsCalculating(false)
    }, [selectedExposureAsset])

    // Find the highest APR vault with real data - prevent looping
    useEffect(() => {
        if (vaults.length > 0 && !hasCalculated.current && !aprLoading && Object.keys(vaultAPRs).length > 0) {
            // Check cache first
            const cached = highestAPRCache.get(vaultKey)
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                setHighestAPRVault(cached.data.highestAPRVault)
                hasCalculated.current = true
                return
            }

            // Only calculate once per vault set - prevent loops
            if (!isCalculating) {
                setIsCalculating(true)
                hasCalculated.current = true

                // Find the vault with the highest APR using real data
                const vaultsWithAPR = vaults.map(vault => ({
                    vault,
                    aprData: vaultAPRs[vault.address],
                    totalAPR: vaultAPRs[vault.address]?.totalAPR || 0
                })).filter(item => item.aprData && !item.aprData.error && item.totalAPR > 0)

                if (vaultsWithAPR.length > 0) {
                    const highestAPR = vaultsWithAPR.reduce((max, current) =>
                        current.totalAPR > max.totalAPR ? current : max
                    )

                    const result = {
                        highestAPRVault: highestAPR.vault,
                        vaultAPRs: vaultsWithAPR.reduce((acc, item) => ({
                            ...acc,
                            [item.vault.address]: item.totalAPR
                        }), {})
                    }

                    // Cache the result
                    highestAPRCache.set(vaultKey, { data: result, timestamp: Date.now() })

                    setHighestAPRVault(result.highestAPRVault)
                } else {
                    // Fallback to first vault if no valid APRs
                    setHighestAPRVault(vaults[0])
                }

                setIsCalculating(false)
            }
        }
    }, [vaults, vaultKey, isCalculating, aprLoading, vaultAPRs])

    if (isLoading || aprLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">Best {selectedExposureAsset} Vault</h2>
                    <p className="text-slate-400">
                        {isLoading ? 'Loading vault data from Cabana...' : 'Fetching real APR data...'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="bg-slate-800/10 border-slate-700/50">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 flex-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <Card className="bg-slate-800/10 border-slate-700/50 max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-slate-100">Error Loading Vaults</CardTitle>
                        <CardDescription className="text-slate-400">
                            Unable to load vault data from Cabana
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500 text-sm">
                            {error.message || 'Please check your connection and try again.'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (vaults.length === 0) {
        return (
            <div className="text-center py-12">
                <Card className="bg-slate-800/10 border-slate-700/50 max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-slate-100">No {selectedExposureAsset} Vaults Available</CardTitle>
                        <CardDescription className="text-slate-400">
                            No prize pool vaults found for {selectedExposureAsset} exposure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500 text-sm">
                            Try selecting a different exposure asset or check back later for new vault opportunities.
                        </p>
                        <div className="mt-4 text-xs text-slate-600">
                            <p>Supported {selectedExposureAsset} assets:</p>
                            <p className="font-mono">
                                {selectedExposureAsset === 'BTC' && 'cbBTC, WBTC, LBTC'}
                                {selectedExposureAsset === 'ETH' && 'wstETH, rETH, msETH, WETH, CBETH'}
                                {selectedExposureAsset === 'USD' && 'USDC, USDT, sUSDe, USDe, DAI, GHO, frxUSD, USDf, USDS, USD0, USD0++, USR, wstUSR'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Best {selectedExposureAsset} Vault</h2>
                <p className="text-slate-400 mb-4">
                    Highest APR vault for {selectedExposureAsset} exposure
                </p>
                <div className="flex justify-center gap-4 mb-4">
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                        Highest APR
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                        {selectedExposureAsset} Optimized
                    </Badge>
                </div>
                <div className="text-xs text-slate-500 mb-4">
                    Showing {vaults.length} vault{vaults.length !== 1 ? 's' : ''} for {selectedExposureAsset} exposure
                </div>
                {/* Debug information - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-slate-600 mb-4 max-w-2xl mx-auto">
                        <details className="text-left">
                            <summary className="cursor-pointer">Debug: Asset Mapping</summary>
                            <div className="mt-2 p-2 bg-slate-800/20 rounded text-xs">
                                <p className="mb-2">All vaults and their mapped assets:</p>
                                {allVaults.map((vault, index) => {
                                    const mappedAsset = mapVaultToExposureAsset(vault)
                                    const isSelected = mappedAsset === selectedExposureAsset
                                    const isUnmapped = mappedAsset === null
                                    return (
                                        <div key={index} className={`mb-1 p-1 rounded ${isSelected ? 'bg-green-500/20' :
                                            isUnmapped ? 'bg-red-500/20' :
                                                'bg-slate-700/20'
                                            }`}>
                                            <span className="font-mono">{vault.symbol || 'Unknown'}</span> →
                                            <span className={`ml-1 ${isSelected ? 'text-green-400' :
                                                isUnmapped ? 'text-red-400' :
                                                    'text-slate-400'
                                                }`}>
                                                {mappedAsset || 'UNMAPPED'} {isSelected ? '✓' : isUnmapped ? '⚠️' : ''}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </details>
                    </div>
                )}
            </div>

            {highestAPRVault ? (
                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        <VaultCard
                            key={`${highestAPRVault.chainId}-${highestAPRVault.address}`}
                            vaultAddress={highestAPRVault.address}
                            vaultName={highestAPRVault.name || 'Unknown Vault'}
                            vaultSymbol={highestAPRVault.symbol || 'UNKNOWN'}
                            vaultDescription={`Best ${selectedExposureAsset} vault with highest APR on Base network`}
                            vaultLogo={highestAPRVault.logoURI}
                            apr={vaultAPRs[highestAPRVault.address]?.totalAPR || 0}
                            onDeposit={onDeposit}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <Card className="bg-slate-800/10 border-slate-700/50 max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle className="text-slate-100">No Vault Found</CardTitle>
                            <CardDescription className="text-slate-400">
                                No vault available for {selectedExposureAsset}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </div>
    )
}
