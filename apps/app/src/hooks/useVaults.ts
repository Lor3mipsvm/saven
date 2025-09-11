import { useSelectedVaults } from '@generationsoftware/hyperstructure-react-hooks'

export const useVaults = () => {
    const { vaults, isFetched } = useSelectedVaults()

    // If no vaults are selected or vaults is undefined, return a safe fallback
    if (!vaults || !vaults.vaults || Object.keys(vaults.vaults).length === 0) {
        return { vaults: {}, isFetched: false }
    }

    return { vaults, isFetched }
}
