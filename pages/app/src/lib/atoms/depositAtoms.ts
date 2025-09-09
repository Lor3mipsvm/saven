import { atom } from 'jotai'
import { Address } from 'viem'

// Form state atoms
export const depositFormTokenAddressAtom = atom<Address | undefined>(undefined)
export const depositFormTokenAmountAtom = atom<string>('')
export const depositFormShareAmountAtom = atom<string>('')

// Zap-specific atoms
export const depositZapPriceImpactAtom = atom<number | undefined>(undefined)
export const depositZapMinReceivedAtom = atom<bigint | undefined>(undefined)

// Modal state atoms
export const depositModalOpenAtom = atom<boolean>(false)
export const depositModalViewAtom = atom<'main' | 'review' | 'waiting' | 'confirming' | 'success' | 'error'>('main')
export const depositTxHashAtom = atom<string | undefined>(undefined)
