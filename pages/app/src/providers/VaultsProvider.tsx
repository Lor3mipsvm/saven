'use client'

import React from 'react'
import { Vaults } from '@generationsoftware/hyperstructure-client-js'
import { publicClients } from '@/lib/clients'
import vaultList from '@/data/vaultList.json'

export const VaultsContext = React.createContext<Vaults | null>(null)

export const VaultsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const v = React.useMemo(() => {
        console.log('🏗️ Creating Vaults object:', {
            vaultListTokens: vaultList.tokens,
            publicClients,
            vaultListLength: vaultList.tokens.length
        })
        const vaults = new Vaults(vaultList.tokens as any, publicClients)
        console.log('✅ Vaults object created:', {
            vaults,
            vaultsSize: vaults.vaults?.size || 'no size property'
        })
        return vaults
    }, [])
    return <VaultsContext.Provider value={v}>{children}</VaultsContext.Provider>
}

export const useVaults = () => {
    const context = React.useContext(VaultsContext)
    if (!context) {
        throw new Error('useVaults must be used within a VaultsProvider')
    }
    return context
}
