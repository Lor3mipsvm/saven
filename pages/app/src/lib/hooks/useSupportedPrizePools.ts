import { useMemo } from 'react'
import { useVaults } from '@/providers/VaultsProvider'

export interface PrizePool {
    chainId: number
    address: string
    name: string
    symbol: string
}

export const useSupportedPrizePools = () => {
    const vaults = useVaults()

    const prizePools = useMemo(() => {
        const pools: Record<string, PrizePool> = {}

        // Get unique chain IDs from vaults
        const chainIds = new Set<number>()
        Object.values(vaults.vaults).forEach(vault => {
            chainIds.add(vault.chainId)
        })

        // Create prize pool entries for each chain
        chainIds.forEach(chainId => {
            const chainVaults = Object.values(vaults.vaults).filter(v => v.chainId === chainId)
            if (chainVaults.length > 0) {
                // Use the first vault as the representative for this chain
                const representativeVault = chainVaults[0]
                const poolId = `${chainId}-${representativeVault.address}`

                pools[poolId] = {
                    chainId,
                    address: representativeVault.address,
                    name: `Prize Pool ${chainId}`,
                    symbol: `PP${chainId}`
                }
            }
        })

        return pools
    }, [vaults])

    return prizePools
}
