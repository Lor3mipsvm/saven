import { VaultList } from '@shared/types'
import { DOMAINS } from '@shared/utilities'
import { baseVaults } from './base'

const defaultVaultList: VaultList = {
  name: 'Cabana Base Miniapp Vault List',
  keywords: ['pooltogether', 'cabana', 'g9', 'world'],
  version: { major: 1, minor: 0, patch: 0 },
  timestamp: '2025-06-02T11:48:19Z',
  logoURI: `${DOMAINS.app}/favicon.png`,
  tokens: [...baseVaults]
}

export default defaultVaultList
