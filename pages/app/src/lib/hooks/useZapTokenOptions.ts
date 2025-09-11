import { useMemo } from 'react'
import { Address } from 'viem'
import { useVaults } from '@/providers/VaultsProvider'

export interface Token {
    chainId: number
    address: Address
    symbol: string
    name: string
    decimals: number
    logoURI?: string
    amount?: bigint
    price?: number
    value?: number
}

export interface ZapTokenOptions {
    includeNativeAsset?: boolean
    includeVaultsWithBalance?: boolean
    includeBeefyVault?: boolean
}

export const useZapTokenOptions = (
    chainId: number,
    options: ZapTokenOptions = {}
) => {
    const vaults = useVaults()

    const tokenOptions = useMemo(() => {
        const tokens: Token[] = []

        // Get vaults for the specified chain
        const chainVaults = Object.values(vaults.vaults).filter(v => v.chainId === chainId)

        chainVaults.forEach(vault => {
            // Add vault token
            if (vault.tokenData) {
                tokens.push({
                    chainId: vault.chainId,
                    address: vault.tokenData.address as Address,
                    symbol: vault.tokenData.symbol,
                    name: vault.tokenData.name,
                    decimals: vault.tokenData.decimals,
                    logoURI: vault.tokenLogoURI || vault.tokenData.logoURI,
                    amount: 0n, // Will be populated by balance hooks
                    price: 0, // Will be populated by price hooks
                    value: 0
                })
            }
        })

        // Add native asset if requested
        if (options.includeNativeAsset) {
            const nativeToken: Token = {
                chainId,
                address: '0x0000000000000000000000000000000000000000' as Address,
                symbol: chainId === 8453 ? 'ETH' : 'ETH', // Base uses ETH
                name: 'Ethereum',
                decimals: 18,
                logoURI: undefined,
                amount: 0n,
                price: 0,
                value: 0
            }
            tokens.push(nativeToken)
        }

        // Filter by balance if requested
        if (options.includeVaultsWithBalance) {
            // This would be filtered by actual balance data
            // For now, return all tokens
        }

        return tokens
    }, [vaults, chainId, options])

    return tokenOptions
}
