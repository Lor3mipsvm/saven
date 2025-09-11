import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useVaultShareData,
    useVaultTokenData
} from '@/lib/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEffect, useMemo, useState } from 'react'
import { formatUnits } from 'viem'

interface SuccessViewProps {
    vault: Vault
    txHash?: string
}

export const SuccessView = (props: SuccessViewProps) => {
    const { vault, txHash } = props

    const { data: share } = useVaultShareData(vault)
    const { data: vaultToken } = useVaultTokenData(vault)

    const [isExploding, setIsExploding] = useState<boolean>(false)

    useEffect(() => {
        setIsExploding(true)
        const timer = setTimeout(() => setIsExploding(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    const sharesReceived = useMemo(() => {
        // This would be calculated from the actual transaction
        return '0.0'
    }, [])

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-4">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {isExploding && (
                            <div className="absolute inset-0 w-20 h-20 mx-auto">
                                <div className="w-20 h-20 border-4 border-green-400 rounded-full animate-ping" />
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Deposit Successful!</h2>
                <p className="text-gray-400">
                    Your deposit has been confirmed and processed
                </p>
            </div>

            <Card className="p-6 space-y-4 bg-slate-800/50 border-slate-700">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-white">You received</h3>
                    <div className="text-3xl font-bold text-amber-400">
                        {sharesReceived} {share?.symbol}
                    </div>
                    <p className="text-sm text-slate-400">
                        Vault shares deposited to {vault.name || 'vault'}
                    </p>
                </div>

                {txHash && (
                    <div className="pt-4 border-t border-slate-600">
                        <div className="text-sm text-slate-500 mb-2">Transaction Hash:</div>
                        <code className="text-amber-400 break-all text-sm bg-slate-700/50 px-2 py-1 rounded">{txHash}</code>
                    </div>
                )}

                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        className="flex-1 border-amber-500 text-amber-400 hover:bg-amber-500/10"
                        onClick={() => window.open(`https://basescan.org/tx/${txHash}`, '_blank')}
                    >
                        View on Explorer
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        onClick={() => {
                            // Share functionality would go here
                            navigator.clipboard.writeText(window.location.href)
                        }}
                    >
                        Share
                    </Button>
                </div>
            </Card>
        </div>
    )
}
