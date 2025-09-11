import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useSelectedVaults,
    useToken,
    useVaultTokenAddress
} from '@/lib/hooks'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
    depositFormTokenAddressAtom,
    depositFormTokenAmountAtom,
    depositFormShareAmountAtom,
    depositZapPriceImpactAtom,
    depositZapMinReceivedAtom
} from '@/lib/atoms/depositAtoms'

interface ReviewViewProps {
    vault: Vault
    prizePool: any
}

export const ReviewView = (props: ReviewViewProps) => {
    const { vault, prizePool } = props

    const formTokenAddress = useAtomValue(depositFormTokenAddressAtom)
    const formTokenAmount = useAtomValue(depositFormTokenAmountAtom)
    const formShareAmount = useAtomValue(depositFormShareAmountAtom)
    const depositZapPriceImpact = useAtomValue(depositZapPriceImpactAtom)
    const depositZapMinReceived = useAtomValue(depositZapMinReceivedAtom)

    const { data: vaultTokenAddress } = useVaultTokenAddress(vault)
    const { data: token } = useToken(vault.chainId, formTokenAddress!)
    // Temporarily comment out to avoid CORS issues
    // const { data: share } = useVaultSharePrice(vault)

    // Create fallback share data
    const share = {
        symbol: 'SHARE',
        decimals: 18,
        price: 0
    }
    const { vaults } = useSelectedVaults()

    const inputVault = useMemo(() => {
        if (!!vault && !!formTokenAddress) {
            return Object.values(vaults.vaults).find((v) => v.chainId === vault.chainId && v.address === formTokenAddress)
        }
    }, [vault, formTokenAddress, vaults])

    const shareLogoURI = useMemo(() => {
        if (!!vault) {
            return vault.logoURI ?? vaults.allVaultInfo.find((v) => v.chainId === vault.chainId && v.address === vault.address)?.logoURI
        }
    }, [vault, vaults])

    // Temporarily comment out to avoid potential external API calls
    // const { data: beefyVault } = useBeefyVault(vault)

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Review Deposit</h2>
                <p className="text-gray-400">
                    Please review your deposit details before confirming
                </p>
            </div>

            <Card className="p-6 space-y-4 bg-slate-800/50 border-slate-700">
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Depositing</span>
                    <div className="text-right">
                        <div className="font-semibold text-white">{formTokenAmount} {token?.symbol}</div>
                        <div className="text-sm text-slate-400">{token?.name}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-slate-300">You'll receive</span>
                    <div className="text-right">
                        <div className="font-semibold text-amber-400">{formShareAmount} {share?.symbol}</div>
                        <div className="text-sm text-slate-400">Vault shares</div>
                    </div>
                </div>

                {depositZapPriceImpact !== undefined && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">Price Impact</span>
                        <Badge
                            variant={depositZapPriceImpact > 5 ? "destructive" : "secondary"}
                            className={depositZapPriceImpact > 5 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}
                        >
                            {depositZapPriceImpact > 0 ? '+' : ''}{depositZapPriceImpact.toFixed(2)}%
                        </Badge>
                    </div>
                )}

                {depositZapMinReceived && share && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">Minimum received</span>
                        <span className="text-amber-400 font-medium">{depositZapMinReceived.toString()} {share.symbol}</span>
                    </div>
                )}

                <div className="pt-4 border-t border-slate-600">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">Vault</span>
                        <span className="text-white font-medium">{vault.name || 'Unknown Vault'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-slate-300">Chain</span>
                        <span className="text-white font-medium">Base</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
