import { Vault } from '@generationsoftware/hyperstructure-client-js'
import { useVaultShareData } from '@/lib/hooks'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface WaitingViewProps {
    vault: Vault
    closeModal: () => void
}

export const WaitingView = (props: WaitingViewProps) => {
    const { vault, closeModal } = props

    const { data: share } = useVaultShareData(vault)

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Transaction Pending</h2>
                <p className="text-gray-400">
                    Please confirm the transaction in your wallet
                </p>
            </div>

            <Card className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto">
                    <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Waiting for confirmation</h3>
                    <p className="text-gray-400">
                        Depositing to {vault.name || 'vault'}...
                    </p>
                </div>

                <Progress value={50} className="w-full" />

                <p className="text-sm text-gray-500">
                    This may take a few moments to complete
                </p>
            </Card>
        </div>
    )
}
