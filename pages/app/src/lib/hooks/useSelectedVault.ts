import { useMemo } from 'react'
import { useVault } from '@generationsoftware/hyperstructure-react-hooks'
import { useVaults } from '@/providers/VaultsProvider'

export const useSelectedVault = () => {
    const vaults = useVaults()

    // For now, return the first vault as the selected vault
    // In a real implementation, this would be based on user selection or URL params
    const vault = useMemo(() => {
        const vaultList = Object.values(vaults.vaults)
        return vaultList.length > 0 ? vaultList[0] : undefined
    }, [vaults.vaults])

    return { vault }
}

// Add a fallback for useSelectedVaults
export const useSelectedVaults = () => {
    const vaults = useVaults()
    return {
        vaults: {
            vaults: vaults.vaults
        }
    }
}
