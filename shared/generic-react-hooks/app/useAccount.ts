import { NETWORK } from '@shared/utilities'
import { atom, useAtom } from 'jotai'
import { Address } from 'viem'
import { LOCAL_STORAGE_KEYS } from '../constants/keys'

const getInitialUserAddress = (): Address | undefined => {
  if (typeof window === 'undefined') return undefined

  const cachedUserAddress = localStorage.getItem(LOCAL_STORAGE_KEYS.userAddress)

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
// const { address: userAddress } = useAccount()
export const useAccount = (): {
  address: string
  chain: NETWORK
  isDisconnected: boolean
  setUserAddress: (userAddress: Address) => void
} => {
  const [userAddress, _setUserAddress] = useAtom(userAddressAtom)

  const address: Address | undefined =
    (localStorage.getItem(LOCAL_STORAGE_KEYS.userAddress) as Address) ?? undefined

  const chain = NETWORK.world
  const isDisconnected = false

  const setUserAddress = (userAddress: Address) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.userAddress, userAddress)
    _setUserAddress(userAddress)
  }

  return { address, chain, isDisconnected, setUserAddress }
}
