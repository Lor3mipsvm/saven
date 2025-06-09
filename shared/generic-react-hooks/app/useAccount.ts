import { atom, useAtom } from 'jotai'
import { Address, Chain } from 'viem'
import { LOCAL_STORAGE_KEYS } from '../constants/keys'

const getInitialUserAddress = (): Address => {
  if (typeof window === 'undefined') return `0x`

  const cachedUserAddress: Address = localStorage.getItem(LOCAL_STORAGE_KEYS.userAddress) as Address

  if (!!cachedUserAddress) {
    return cachedUserAddress
  } else {
    return `0x`
  }
}

const userAddressAtom = atom<Address>(getInitialUserAddress())

/**
 * Returns state of user account / wallet  as well as a method to update it
 * Stores state in local storage
 * @returns
 */
export const useAccount = (): {
  address: Address
  chain: Chain
  isDisconnected: boolean
  setUserAddress: (userAddress: Address) => void
} => {
  const [userAddress, _setUserAddress] = useAtom(userAddressAtom)

  // TODO: Hard-coded Chain ID here, might cause certain things to fall over
  const chain = { id: 480 } as Chain
  const isDisconnected = false

  const setUserAddress = (userAddress: Address) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.userAddress, userAddress as Address)
    _setUserAddress(userAddress)

    if (userAddress === `0x`) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.userAddress)
    }
  }

  return { address: userAddress, chain, isDisconnected, setUserAddress }
}
