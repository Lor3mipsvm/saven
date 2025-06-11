import {
  useAllUserVaultBalances,
  useAllVaultSharePrices,
  useSelectedVaults
} from '@generationsoftware/hyperstructure-react-hooks'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'

/**
 * Returns a user's total balance in ETH
 * @param userAddress user address to get total balance for
 * @returns
 */
export const useUserTotalBalance = (userAddress: Address) => {
  const { vaults, isFetched: isFetchedVaultData } = useSelectedVaults()

  const { data: allVaultShareTokens, isFetched: isFetchedAllVaultShareTokens } =
    useAllVaultSharePrices(vaults)
  console.log('allVaultShareTokens')
  console.log(allVaultShareTokens)

  const { data: vaultBalances, isFetched: isFetchedVaultBalances } = useAllUserVaultBalances(
    vaults,
    userAddress
  )
  // console.log('***************')
  // console.log('vaultBalances')
  // console.log(vaultBalances?.['0x8ad5959c9245b64173d4c0c3cd3ff66dac3cab0e-480'])
  // console.log(vaultBalances?.['0x0045cc66ecf34da9d8d89ad5b36cb82061c0907c-480'])
  // console.log(vaultBalances?.['0x8ad5959c9245b64173d4c0c3cd3ff66dac3cab0e-480'].amount)
  // console.log(vaultBalances?.['0x0045cc66ecf34da9d8d89ad5b36cb82061c0907c-480'].amount)
  // console.log('77712387463287463278')

  const isFetched =
    isFetchedVaultData &&
    isFetchedAllVaultShareTokens &&
    isFetchedVaultBalances &&
    !!allVaultShareTokens &&
    !!vaultBalances &&
    !!vaults.underlyingTokenAddresses &&
    Object.values(allVaultShareTokens).some((token) => token.price !== undefined)

  const data = useMemo(() => {
    if (isFetched) {
      let totalBalance: number = 0
      for (const vaultId in vaultBalances) {
        const decimals = vaultBalances[vaultId].decimals

        if (!isNaN(decimals)) {
          const shareBalance = vaultBalances[vaultId].amount
          console.log('shareBalance')
          console.log(shareBalance)

          const sharePrice = allVaultShareTokens[vaultId]?.price ?? 0
          console.log('sharePrice')
          console.log(sharePrice)

          const formattedShareBalance = formatUnits(shareBalance, decimals)
          totalBalance += Number(formattedShareBalance) * sharePrice
        }
      }
      return totalBalance
    } else {
      return undefined
    }
  }, [
    isFetchedVaultData,
    isFetchedAllVaultShareTokens,
    allVaultShareTokens,
    isFetchedVaultBalances,
    vaultBalances,
    vaults
  ])
  console.log('data')
  console.log(data)

  return { data, isFetched }
}
