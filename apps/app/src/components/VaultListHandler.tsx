import {
  useCachedVaultLists,
  useSelectedVaultListIds
} from '@generationsoftware/hyperstructure-react-hooks'
import { isNewerVersion } from '@shared/utilities'
import { useEffect } from 'react'
import { DEFAULT_VAULT_LISTS } from '@constants/config'

export const VaultListHandler = () => {
  const { cachedVaultLists, cache } = useCachedVaultLists()
  const { select } = useSelectedVaultListIds()

  // Handling Default Vault Lists
  useEffect(() => {
    for (const key in DEFAULT_VAULT_LISTS) {
      const defaultVaultList = DEFAULT_VAULT_LISTS[key as keyof typeof DEFAULT_VAULT_LISTS]
      const cachedVaultList = cachedVaultLists[key]

      if (!cachedVaultList || isNewerVersion(defaultVaultList.version, cachedVaultList.version)) {
        cache(key, defaultVaultList)

        if (key === 'default') {
          select(key, 'local')
        }
      }
    }
  }, [])

  return <></>
}
