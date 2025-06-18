import { VaultList } from '@shared/types'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { LOCAL_STORAGE_KEYS } from '../constants'

const getInitialCachedVaultLists = (): { [id: string]: VaultList } => {
  if (typeof window === 'undefined') return {}
  const cachedVaultLists = localStorage.getItem(LOCAL_STORAGE_KEYS.cachedVaultLists)
  return JSON.parse(cachedVaultLists ?? '{}')
}

const cachedVaultListsAtom = atom<{ [id: string]: VaultList | undefined }>(
  getInitialCachedVaultLists()
)

/**
 * Returns currently cached vault lists
 *
 * Stores state in local storage
 * @returns
 */
export const useCachedVaultLists = () => {
  const [cachedVaultLists, setCachedVaultLists] = useAtom(cachedVaultListsAtom)

  const set = (vaultLists: { [id: string]: VaultList }) => {
    setCachedVaultLists(vaultLists)
  }

  const cache = (id: string, vaultList: VaultList) => {
    setCachedVaultLists((prev) => ({ ...prev, [id]: vaultList }))
  }

  const remove = (id: string) => {
    setCachedVaultLists((prev) => ({ ...prev, [id]: undefined }))
  }

  const clear = () => {
    setCachedVaultLists({})
  }

  // Don't cache the vault list in localStorage ike the typical Cabana does
  // all vaults will be loaded from the default list on every load
  // This prevents cached / stale data from ending up in World user's browsers
  // which is fine since custom vaults won't be able to be supported on World
  // as we need to allow list each individual vault contract we want to interact with
  // in the 'World Basic Dev Portal'
  // useEffect(
  //   () =>
  //     localStorage.setItem(LOCAL_STORAGE_KEYS.cachedVaultLists, JSON.stringify(cachedVaultLists)),
  //   [cachedVaultLists]
  // )

  return {
    cachedVaultLists,
    set,
    cache,
    remove,
    clear
  }
}
