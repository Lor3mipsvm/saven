import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultTokenBalance,
  useVaultBalance,
  useVaultTokenAddress,
  useVaultTokenData,
  useWorldPublicClient
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { TransactionButton } from '@shared/react-components'
import { Button } from '@shared/ui'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { decodeDepositEvent, deposit, type DepositTxOptions } from 'src/minikit_txs'
import { addRecentTransaction, signInWithWallet } from 'src/utils'
import { Address, Hash, parseUnits } from 'viem'
import { DepositModalView } from '.'
import { isValidFormInput } from '../TxFormInput'
import { depositFormTokenAmountAtom } from './DepositForm'

interface DepositTxButtonProps {
  vault: Vault
  setModalView: (view: DepositModalView) => void
  setDepositTxHash: (txHash: string) => void
  setDepositShares: (shares: bigint) => void
  depositTxHash?: string
  refetchUserBalances?: () => void
  onSuccessfulDeposit?: (chainId: number, txHash: Hash, shares: bigint) => void
}

export const DepositTxButton = (props: DepositTxButtonProps) => {
  const {
    vault,
    setModalView,
    setDepositTxHash,
    setDepositShares,
    depositTxHash,
    refetchUserBalances,
    onSuccessfulDeposit
  } = props

  const t_common = useTranslations('Common')
  const t_modals = useTranslations('TxModals')

  const [isWaiting, setIsWaiting] = useState<boolean>(false)
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false)

  const { address: userAddress, chain, isDisconnected } = useAccount()

  const { data: tokenData } = useVaultTokenData(vault)
  const decimals = vault.decimals ?? tokenData?.decimals

  const {
    data: userTokenBalance,
    isFetched: isFetchedUserTokenBalance,
    refetch: refetchUserTokenBalance
  } = useTokenBalance(vault.chainId, userAddress as Address, tokenData?.address as Address)

  const { refetch: refetchUserVaultTokenBalance } = useUserVaultTokenBalance(
    vault,
    userAddress as Address
  )

  const { refetch: refetchUserVaultDelegationBalance } = useUserVaultDelegationBalance(
    vault,
    userAddress as Address
  )

  const { refetch: refetchVaultBalance } = useVaultBalance(vault)

  const formTokenAmount = useAtomValue(depositFormTokenAmountAtom)

  const isValidFormTokenAmount =
    decimals !== undefined ? isValidFormInput(formTokenAmount, decimals) : false

  const depositAmount = isValidFormTokenAmount
    ? parseUnits(formTokenAmount, decimals as number)
    : 0n

  const options: DepositTxOptions = {
    onSend: () => {
      console.log('onSend')
      setIsConfirming(true)
      setModalView('waiting')
    },
    onSuccess: (decodedEventLogs: ReturnType<typeof decodeDepositEvent>, txHash: Address) => {
      setIsSuccessful(true)
      onSuccessfulDeposit?.(vault.chainId, txHash, decodedEventLogs?.args?.shares)
      setModalView('success')

      refetchUserTokenBalance()
      refetchUserVaultTokenBalance()
      refetchUserVaultDelegationBalance()
      refetchVaultBalance()
      refetchUserBalances?.()

      setDepositTxHash(txHash)
      setDepositShares(decodedEventLogs?.args?.shares)
    },
    onSettled: () => {
      console.log('onSettled')
      setIsWaiting(true)
    },
    onError: () => {
      setModalView('error')
      setIsWaiting(false)
      setIsConfirming(false)
      setIsSuccessful(false)
    }
  }
  const { data: tokenAddress, isFetched: isFetchedTokenAddress } = useVaultTokenAddress(vault)
  const publicClient = useWorldPublicClient()
  const sendDepositTransaction = () =>
    deposit(depositAmount, publicClient, vault.address, tokenAddress, options)

  const isDataFetched =
    isFetchedTokenAddress &&
    !isDisconnected &&
    !!userAddress &&
    !!tokenData &&
    isFetchedUserTokenBalance &&
    !!userTokenBalance &&
    !!depositAmount &&
    decimals !== undefined &&
    chain?.id === vault.chainId

  const depositEnabled =
    isDataFetched && userTokenBalance.amount >= depositAmount && isValidFormTokenAmount

  // No deposit amount set
  if (depositAmount === 0n) {
    return (
      <Button color='transparent' fullSized={true} disabled={true}>
        {t_modals('enterAnAmount')}
      </Button>
    )
  }

  // Deposit button
  return (
    <TransactionButton
      chainId={vault.chainId}
      isTxLoading={isWaiting || isConfirming}
      isTxSuccess={isSuccessful}
      write={sendDepositTransaction}
      txHash={depositTxHash}
      txDescription={t_modals('depositTx', { symbol: tokenData?.symbol ?? '?' })}
      fullSized={true}
      disabled={!depositEnabled}
      addRecentTransaction={addRecentTransaction}
      signInWithWallet={signInWithWallet}
      intl={{ base: t_modals, common: t_common }}
    >
      {t_modals('confirmDeposit')}
    </TransactionButton>
  )
}
