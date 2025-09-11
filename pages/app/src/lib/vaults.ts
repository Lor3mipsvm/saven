import { Vaults } from '@generationsoftware/hyperstructure-client-js'
import { publicClients } from './clients'
import vaultList from '@/data/vaultList.json'

// vaultList.tokens must contain entries whose chainId exist in publicClients
export const vaults = new Vaults(vaultList.tokens as any, publicClients)
