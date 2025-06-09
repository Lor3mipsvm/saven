import { atom, useAtom } from 'jotai'
import { Address, Chain } from 'viem'
import { LOCAL_STORAGE_KEYS } from '../constants/keys'

const getInitialUserAddress = (): Address | undefined => {
  if (typeof window === 'undefined') return undefined

  const cachedUserAddress: Address | undefined =
    (localStorage.getItem(LOCAL_STORAGE_KEYS.userAddress) as Address) ?? undefined

  if (!!cachedUserAddress) {
    return cachedUserAddress as Address
  }
}

const userAddressAtom = atom<Address | undefined>(getInitialUserAddress())

/**
 * Returns state of user account / wallet  as well as a method to update it
 * Stores state in local storage
 * @returns
 */
export const useAccount = (): {
  address: string | undefined
  chain: Chain
  isDisconnected: boolean
  setUserAddress: (userAddress: Address | undefined) => void
} => {
  const [userAddress, _setUserAddress] = useAtom(userAddressAtom)

  // TODO: Hard-coded Chain ID here, might cause certain things to fall over
  const chain = { id: 480 } as Chain
  const isDisconnected = false

  const setUserAddress = (userAddress: Address | undefined) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.userAddress, userAddress as Address)
    _setUserAddress(userAddress)

    if (userAddress === undefined) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.userAddress)
    }
  }

  return { address: userAddress, chain, isDisconnected, setUserAddress }
}
