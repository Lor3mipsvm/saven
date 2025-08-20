import { getAssetsFromShares, Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSend5792RedeemTransaction, // useSendRedeemTransaction,
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultShareBalance,
  useUserVaultTokenBalance,
  useVaultBalance,
  useVaultExchangeRate,
  useVaultTokenData
} from '@generationsoftware/hyperstructure-react-hooks'
// import { useAddRecentTransaction, useChainModal, useConnectModal } from '@rainbow-me/rainbowkit'
import { TransactionButton } from '@shared/react-components'
import { Button } from '@shared/ui'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { addRecentTransaction } from 'src/utils'
import { Address, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { PAYMASTER_URLS } from '@constants/config'
import { WithdrawModalView } from '.'
import { isValidFormInput } from '../TxFormInput'
import { withdrawFormShareAmountAtom } from './WithdrawForm'

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

  // const { openConnectModal } = useConnectModal()
  // const { openChainModal } = useChainModal()
  // const addRecentTransaction = useAddRecentTransaction()

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

  const paymasterUrl = PAYMASTER_URLS[vault.chainId]
  const isUsingEip7677 = !!paymasterUrl
  const data5792Tx = useSend5792RedeemTransaction(withdrawAmount, vault, {
    minAssets: expectedAssetAmount,
    paymasterService: isUsingEip7677 ? { url: paymasterUrl, optional: true } : undefined,
    onSend: () => {
      setModalView('waiting')
    },
    onSuccess: () => {
      setTimeout(() => {
        refetchUserTokenBalance()
        refetchUserVaultTokenBalance()
        refetchUserVaultDelegationBalance()
        refetchVaultBalance()
        refetchUserBalances?.()
      }, 7000)

      onSuccessfulWithdrawal?.()
      setModalView('success')
    },
    onError: () => {
      setModalView('error')
    },
    enabled: true
  })

  const sendTx = data5792Tx.send5792RedeemTransaction
  const isWaitingWithdrawal = data5792Tx.isWaiting
  const isConfirmingWithdrawal = data5792Tx.isConfirming
  const isSuccessfulWithdrawal = data5792Tx.isSuccess
  const withdrawTxHash = data5792Tx.txHashes?.at(-1)

  useEffect(() => {
    if (!!withdrawTxHash && !isWaitingWithdrawal) {
      setWithdrawTxHash(withdrawTxHash)
    }
  }, [withdrawTxHash, isConfirmingWithdrawal])

  const withdrawEnabled =
    !isDisconnected &&
    !!userAddress &&
    !!tokenData &&
    isFetchedUserVaultShareBalance &&
    !!userVaultShareBalance &&
    isValidFormShareAmount &&
    !!withdrawAmount &&
    userVaultShareBalance.amount >= withdrawAmount &&
    !!sendTx

  if (withdrawAmount === 0n) {
    return (
      <Button color='transparent' fullSized={true} disabled={true}>
        {t_modals('enterAnAmount')}
      </Button>
    )
  } else {
    return (
      <TransactionButton
        chainId={vault.chainId}
        isTxLoading={isWaitingWithdrawal || isConfirmingWithdrawal}
        isTxSuccess={isSuccessfulWithdrawal}
        write={sendTx}
        txHash={withdrawTxHash}
        txDescription={t_modals('withdrawTx', { symbol: tokenData?.symbol ?? '?' })}
        fullSized={true}
        disabled={!withdrawEnabled}
        addRecentTransaction={addRecentTransaction}
        intl={{ common: t_common }}
      >
        {t_modals('confirmWithdrawal')}
      </TransactionButton>
    )
  }
}
