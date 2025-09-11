import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
    useVaultExchangeRate,
    useVaultShareData,
    useVaultTokenAddress
} from '@/lib/hooks'
import { useAtomValue } from 'jotai'
import { depositFormTokenAddressAtom, depositFormShareAmountAtom } from '@/lib/atoms/depositAtoms'
import { DepositForm } from '../DepositForm'

interface MainViewProps {
    vault: Vault
    prizePool: any
}

export const MainView = (props: MainViewProps) => {
    const { vault, prizePool } = props

    const { data: share } = useVaultShareData(vault)
    const { data: vaultTokenAddress } = useVaultTokenAddress(vault)
    const formTokenAddress = useAtomValue(depositFormTokenAddressAtom)
    const formShareAmount = useAtomValue(depositFormShareAmountAtom)

    const { data: vaultExchangeRate } = useVaultExchangeRate(vault)

    return (
        <div className="space-y-6">
            <div className="text-center">
                <p className="text-gray-400">
                    Deposit {vault.name || 'tokens'} to earn rewards
                </p>
            </div>

            <DepositForm vault={vault} showInputInfoRows={true} />

            {vaultExchangeRate && (
                <div className="text-center text-sm text-gray-400">
                    Exchange rate: 1 {share?.symbol} = {vaultExchangeRate.toString()} {vaultTokenAddress}
                </div>
            )}
        </div>
    )
}
