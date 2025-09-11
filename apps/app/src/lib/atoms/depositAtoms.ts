import { atom } from 'jotai'

export const depositModalOpenAtom = atom(false)
export const depositFormTokenAddressAtom = atom<string | undefined>(undefined)
export const depositFormTokenAmountAtom = atom<string>('')
export const depositFormShareAmountAtom = atom<string>('')
export const depositZapPriceImpactAtom = atom<number | undefined>(undefined)
export const depositZapMinReceivedAtom = atom<bigint | undefined>(undefined)
export const depositModalViewAtom = atom<'main' | 'review' | 'confirming' | 'success' | 'error' | 'waiting'>('main')
export const depositTxHashAtom = atom<string | undefined>(undefined)
