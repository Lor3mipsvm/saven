import { NO_REFETCH } from '@shared/generic-react-hooks'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'

const USERNAMES_URL = 'https://usernames.worldcoin.org/api/v1/'

export const useWorldUsernameResult = (address: Address) => {
  return useQuery({
    queryKey: ['worldUsernameResult', address],
    queryFn: async () => {
      const uri = `${USERNAMES_URL}${address}`

      const response = await fetch(uri, {
        method: 'GET'
      })
      if (!response.ok) {
        console.error(`Response status: ${response.status}`)
        throw new Error(`Response status: ${response.status}`)
      }

      const res = await response.json()
      console.log('res')
      console.log(res)
      return res
    },
    enabled: !!address,
    ...NO_REFETCH
  })
}
