import { getAssetsFromShares, Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultShareBalance,
  useUserVaultTokenBalance,
  useVaultBalance,
  useVaultExchangeRate,
  useVaultTokenData,
  useWorldPublicClient
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { TransactionButton } from '@shared/react-components'
import { Button } from '@shared/ui'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { redeem } from 'src/minikit_txs'
import { addRecentTransaction, signInWithWallet } from 'src/utils'
import { Address, parseUnits } from 'viem'
import { WithdrawModalView } from '.'
import { isValidFormInput } from '../TxFormInput'
import { withdrawFormShareAmountAtom } from './WithdrawForm'

// useSendRedeemTransaction,

interface WithdrawTxButtonProps {
  vault: Vault
  modalView: string
  setModalView: (view: WithdrawModalView) => void
  setWithdrawTxHash: (txHash: string) => void
  refetchUserBalances?: () => void
  onSuccessfulWithdrawal?: () => void
}

export const WithdrawTxButton = (props: WithdrawTxButtonProps) => {
  const {
    vault,
    modalView,
    setModalView,
    setWithdrawTxHash,
    refetchUserBalances,
    onSuccessfulWithdrawal
  } = props

  const t_common = useTranslations('Common')
  const t_modals = useTranslations('TxModals')

  const { address: userAddress, chain, isDisconnected } = useAccount()

  const { data: tokenData } = useVaultTokenData(vault)
  const decimals = vault.decimals ?? tokenData?.decimals

  const { data: userVaultShareBalance, isFetched: isFetchedUserVaultShareBalance } =
    useUserVaultShareBalance(vault, userAddress as Address)

  const { refetch: refetchUserVaultTokenBalance } = useUserVaultTokenBalance(
    vault,
    userAddress as Address
  )

  const { refetch: refetchUserTokenBalance } = useTokenBalance(
    vault.chainId,
    userAddress as Address,
    tokenData?.address as Address
  )

  const { refetch: refetchUserVaultDelegationBalance } = useUserVaultDelegationBalance(
    vault,
    userAddress as Address
  )

  const { refetch: refetchVaultBalance } = useVaultBalance(vault)

  const { data: vaultExchangeRate } = useVaultExchangeRate(vault)

  const formShareAmount = useAtomValue(withdrawFormShareAmountAtom)

  const isValidFormShareAmount =
    decimals !== undefined ? isValidFormInput(formShareAmount, decimals) : false

  const withdrawAmount = isValidFormShareAmount
    ? parseUnits(formShareAmount, decimals as number)
    : 0n

  // TODO: this should accept user input in case of lossy vaults
  const expectedAssetAmount =
    !!withdrawAmount && !!vaultExchangeRate
      ? getAssetsFromShares(withdrawAmount, vaultExchangeRate, decimals as number)
      : 0n

  // const dataTx = useSendRedeemTransaction(withdrawAmount, vault, {
  //   minAssets: expectedAssetAmount,
  //   onSend: () => {
  //     setModalView('waiting')
  //   },
  //   onSuccess: () => {
  //     refetchUserTokenBalance()
  //     refetchUserVaultTokenBalance()
  //     refetchUserVaultDelegationBalance()
  //     refetchVaultBalance()
  //     refetchUserBalances?.()
  //     onSuccessfulWithdrawal?.()
  //     setModalView('success')
  //   },
  //   onError: () => {
  //     setModalView('error')
  //   }
  // })

  return null
  // const sendTx = dataTx.sendRedeemTransaction

  // amount: bigint,
  // publicClient: any,
  // userAddress: Address,
  // prizeVaultAddress: Address,
  const publicClient = useWorldPublicClient()

  const sendTx = () => redeem(withdrawAmount, publicClient, userAddress as Address, vault.address)

  // const isWaitingWithdrawal = dataTx.isWaiting
  // const isConfirmingWithdrawal = dataTx.isConfirming
  // const isSuccessfulWithdrawal = dataTx.isSuccess
  // const withdrawTxHash = dataTx.txHash

  // useEffect(() => {
  //   if (
  //     !!withdrawTxHash &&
  //     isConfirmingWithdrawal &&
  //     !isWaitingWithdrawal &&
  //     !isSuccessfulWithdrawal
  //   ) {
  //     setWithdrawTxHash(withdrawTxHash)
  //     setModalView('confirming')
  //   }
  // }, [withdrawTxHash, isConfirmingWithdrawal])

  // const withdrawEnabled =
  //   !isDisconnected &&
  //   !!userAddress &&
  //   !!tokenData &&
  //   isFetchedUserVaultShareBalance &&
  //   !!userVaultShareBalance &&
  //   isValidFormShareAmount &&
  //   !!withdrawAmount &&
  //   userVaultShareBalance.amount >= withdrawAmount &&
  //   !!sendTx

  // if (withdrawAmount === 0n) {
  //   return (
  //     <Button color='transparent' fullSized={true} disabled={true}>
  //       {t_modals('enterAnAmount')}
  //     </Button>
  //   )
  // } else {
  //   return (
  //     <TransactionButton
  //       chainId={vault.chainId}
  //       isTxLoading={isWaitingWithdrawal || isConfirmingWithdrawal}
  //       isTxSuccess={isSuccessfulWithdrawal}
  //       write={sendTx}
  //       txHash={withdrawTxHash}
  //       txDescription={t_modals('withdrawTx', { symbol: tokenData?.symbol ?? '?' })}
  //       fullSized={true}
  //       disabled={!withdrawEnabled}
  //       addRecentTransaction={addRecentTransaction}
  //       signInWithWallet={signInWithWallet}
  //       intl={{ base: t_modals, common: t_common }}
  //     >
  //       {t_modals('confirmWithdrawal')}
  //     </TransactionButton>
  //   )
  // }
}
