import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorViewProps {
    setModalView: (view: 'main' | 'review' | 'waiting' | 'confirming' | 'success' | 'error') => void
}

export const ErrorView = (props: ErrorViewProps) => {
    const { setModalView } = props

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4">
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Transaction Failed</h2>
                <p className="text-gray-400">
                    Your deposit transaction could not be completed
                </p>
            </div>

            <Card className="p-6 space-y-4">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-white">What went wrong?</h3>
                    <p className="text-sm text-gray-400">
                        The transaction may have failed due to insufficient gas, network congestion, or other issues.
                    </p>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setModalView('main')}
                    >
                        Try Again
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => setModalView('main')}
                    >
                        Close
                    </Button>
                </div>
            </Card>
        </div>
    )
}
