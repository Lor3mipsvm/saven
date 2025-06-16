import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useTokenAllowance,
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultTokenBalance,
  useVaultBalance,
  useVaultTokenData
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { TransactionButton } from '@shared/react-components'
import { Button } from '@shared/ui'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { addRecentTransaction, signInWithWallet } from 'src/utils'
import { Address, Hash, parseUnits } from 'viem'
import { useSendDepositTransaction } from '@hooks/useSendDepositTransaction'
import { DepositModalView } from '.'
import { isValidFormInput } from '../TxFormInput'
import { depositFormTokenAmountAtom } from './DepositForm'

interface DepositTxButtonProps {
  vault: Vault
  setModalView: (view: DepositModalView) => void
  setDepositTxHash: (txHash: string) => void
  setDepositShares: (txHash: string) => void
  refetchUserBalances?: () => void
  onSuccessfulDeposit?: (chainId: number, txHash: Hash) => void
}

export const DepositTxButton = (props: DepositTxButtonProps) => {
  const {
    vault,
    setModalView,
    setDepositTxHash,
    setDepositShares,
    refetchUserBalances,
    onSuccessfulDeposit
  } = props

  const t_common = useTranslations('Common')
  const t_modals = useTranslations('TxModals')

  const { address: userAddress, chain, isDisconnected } = useAccount()

  const { data: tokenData } = useVaultTokenData(vault)
  const decimals = vault.decimals ?? tokenData?.decimals

  const {
    data: allowance,
    isFetched: isFetchedAllowance,
    refetch: refetchTokenAllowance
  } = useTokenAllowance(
    vault.chainId,
    userAddress as Address,
    vault.address,
    tokenData?.address as Address
  )

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

  const options = {
    onSend: () => {
      console.log('onSend')
      setModalView('waiting')

      // isDepositing = true
      // toast.loading(`Depositing ...`, {
      //   duration: 30000,
      //   style: 'border: 2px solid var(--pt-teal-dark); '
      // })
    },
    // onSuccess: (depositEvent: any) => {
    onSuccess: (txReceipt: any) => {
      refetchUserTokenBalance()
      refetchUserVaultTokenBalance()
      refetchUserVaultDelegationBalance()
      refetchVaultBalance()
      refetchTokenAllowance()
      refetchUserBalances?.()
      console.log('txReceipt')
      console.log(txReceipt)
      console.log('txReceipt?.args')
      console.log(txReceipt?.args)
      console.log('txReceipt?.args?.shares')
      console.log(txReceipt?.args?.shares)
      // onSuccessfulDeposit?.(vault.chainId, txReceipt.transactionHash)
      onSuccessfulDeposit?.(vault.chainId, txReceipt?.args?.shares)
      setModalView('success')
      console.log('onSuccess')

      ///
      ///

      // console.log('onSuccess')
      // toast.dismiss()

      // console.log('depositEvent')
      // console.log(depositEvent)
      // console.log('depositEvent?.args')
      // console.log(depositEvent?.args)
      // console.log('depositEvent?.args?.assets')
      // console.log(depositEvent?.args?.assets)

      // toast.success(`Success! You deposited ${formattedAmount} ${prizeVault.asset.symbol}`, {
      //   duration: 8000,
      //   style: 'border: 2px solid var(--pt-teal-dark); '
      // })
      // playConfetti()

      // onSuccess(depositEvent?.args?.assets)
    },
    onSettled: () => {
      console.log('onSettled')
      // updateUserTransferEvents($userAddress, $userTransferEvents ?? [])
      // updateUserTokenBalances($userAddress)
      // isDepositing = false
    },
    onError: () => {
      console.log('onError')

      setModalView('error')

      // toast.dismiss()
      // toast.error(`Something went wrong, please try again.`, {
      //   duration: 8000,
      //   style: 'border: 2px solid var(--pt-warning-med); '
      // })
    }
  }
  const dataDepositTx = useSendDepositTransaction(depositAmount, vault, options)

  // const sendDepositTransaction = dataDepositTx.sendDepositTransaction

  // const sendDepositTransaction = () =>
  //   deposit(depositAmount, publicClient, vault.address, tokenData?.address, options)

  const sendDepositTransaction = dataDepositTx.sendDepositTransaction
  const isWaitingDeposit = dataDepositTx.isWaiting
  const isConfirmingDeposit = dataDepositTx.isConfirming
  const isSuccessfulDeposit = dataDepositTx.isSuccess
  const depositTxHash = dataDepositTx.txHash
  const depositShares = dataDepositTx.shares as string

  useEffect(() => {
    if (!!depositTxHash && isConfirmingDeposit && !isWaitingDeposit && !isSuccessfulDeposit) {
      setDepositTxHash(depositTxHash)
      setDepositShares(depositShares)
      setModalView('confirming')
    }
  }, [depositTxHash, depositShares, isConfirmingDeposit])

  const isDataFetched =
    !isDisconnected &&
    !!userAddress &&
    !!tokenData &&
    isFetchedUserTokenBalance &&
    !!userTokenBalance &&
    isFetchedAllowance &&
    allowance !== undefined &&
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
      isTxLoading={isWaitingDeposit || isConfirmingDeposit}
      isTxSuccess={isSuccessfulDeposit}
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
