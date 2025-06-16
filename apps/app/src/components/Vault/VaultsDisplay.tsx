import {
  SortId,
  useSelectedVaults,
  useSortedVaults
} from '@generationsoftware/hyperstructure-react-hooks'
import { Spinner } from '@shared/ui'
import { useAtomValue, useSetAtom } from 'jotai'
import { useSupportedPrizePools } from '@hooks/useSupportedPrizePools'
import { VaultCards } from './VaultCards'
import { filteredVaultsAtom, filterIdAtom, vaultListFilterIdAtom } from './VaultFilters'
import { VaultsTable } from './VaultsTable'

export const VaultsDisplay = () => {
  const { vaults, isFetched: isFetchedVaultData } = useSelectedVaults()

  const prizePools = useSupportedPrizePools()
  const prizePoolsArray = Object.values(prizePools)

  const {
    isFetched: isFetchedSortedVaults,
    sortVaultsBy,
    setSortVaultsBy,
    sortDirection,
    setSortDirection,
    toggleSortDirection
  } = useSortedVaults(vaults, {
    prizePools: prizePoolsArray,
    defaultSortId: 'totalBalance'
  })

  const filteredVaults = useAtomValue(filteredVaultsAtom)

  if (!isFetchedVaultData || !isFetchedSortedVaults || !filteredVaults) {
    return <Spinner />
  }

  const onSort = (id: SortId) => {
    if (sortVaultsBy === id) {
      toggleSortDirection()
    } else {
      setSortDirection('desc')
      setSortVaultsBy(id)
    }
  }

  const getSortDirection = (id: SortId) => {
    if (sortVaultsBy === id) {
      return sortDirection
    }
  }

  return (
    <>
      <VaultsTable
        vaults={filteredVaults}
        onSort={onSort}
        getSortDirection={getSortDirection}
        className='hidden lg:block'
      />
      <VaultCards vaults={filteredVaults} className='lg:hidden' />
    </>
  )
}
