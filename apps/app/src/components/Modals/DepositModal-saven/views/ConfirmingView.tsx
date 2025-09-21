import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { useVaultShareData } from '@/lib/hooks'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface ConfirmingViewProps {
    vault: Vault
    txHash?: string
    closeModal: () => void
}

export const ConfirmingView = (props: ConfirmingViewProps) => {
    const { vault, txHash, closeModal } = props

    const { data: share } = useVaultShareData(vault)

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Transaction Confirming</h2>
                <p className="text-gray-400">
                    Your transaction is being processed on the blockchain
                </p>
            </div>

            <Card className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto">
                    <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Confirming transaction</h3>
                    <p className="text-gray-400">
                        Depositing to {vault.name || 'vault'}...
                    </p>
                </div>

                <Progress value={75} className="w-full" />

                {txHash && (
                    <div className="text-sm">
                        <p className="text-gray-500 mb-2">Transaction Hash:</p>
                        <code className="text-amber-400 break-all">{txHash}</code>
                    </div>
                )}

                <p className="text-sm text-gray-500">
                    This usually takes 1-2 minutes to complete
                </p>
            </Card>
        </div>
    )
}
