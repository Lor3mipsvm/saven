import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSendGenericApproveTransaction,
  useSendWithdrawZapTransaction,
  useToken,
  useTokenAllowance,
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultShareBalance,
  useUserVaultTokenBalance,
  useVaultBalance,
  useVaultShareData,
  useVaultTokenAddress
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { ApprovalTooltip, TransactionButton } from '@shared/react-components'
import { Button } from '@shared/ui'
import { ZAP_SETTINGS } from '@shared/utilities'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { addRecentTransaction, signInWithWallet } from 'src/utils'
import { isAddress, parseUnits } from 'viem'
import { WithdrawModalView } from '.'
import { isValidFormInput } from '../TxFormInput'
import { withdrawFormShareAmountAtom, withdrawFormTokenAddressAtom } from './WithdrawForm'

interface WithdrawZapTxButtonProps {
  vault: Vault
  modalView: string
  setModalView: (view: WithdrawModalView) => void
  setWithdrawTxHash: (txHash: string) => void
  refetchUserBalances?: () => void
  onSuccessfulApproval?: () => void
  onSuccessfulWithdrawalWithZap?: () => void
}

export const WithdrawZapTxButton = (props: WithdrawZapTxButtonProps) => {
  const {
    vault,
    modalView,
    setModalView,
    setWithdrawTxHash,
    refetchUserBalances,
    onSuccessfulApproval,
    onSuccessfulWithdrawalWithZap
  } = props

  const t_common = useTranslations('Common')
  const t_modals = useTranslations('TxModals')
  const t_tooltips = useTranslations('Tooltips')

  const { address: userAddress, chain, isDisconnected } = useAccount()

  const formOutputTokenAddress = useAtomValue(withdrawFormTokenAddressAtom)

  const { data: share } = useVaultShareData(vault)

  const { data: vaultTokenAddress } = useVaultTokenAddress(vault)

  const outputTokenAddress =
    !!formOutputTokenAddress && isAddress(formOutputTokenAddress)
      ? formOutputTokenAddress
      : vaultTokenAddress

  const { data: outputToken } = useToken(vault.chainId, outputTokenAddress!)

  const zapTokenManagerAddress = ZAP_SETTINGS[vault.chainId]?.zapTokenManager

  const {
    data: allowance,
    isFetched: isFetchedAllowance,
    refetch: refetchTokenAllowance
  } = useTokenAllowance(vault.chainId, userAddress!, zapTokenManagerAddress, vault.address)

  const { data: userVaultShareBalance, isFetched: isFetchedUserVaultShareBalance } =
    useUserVaultShareBalance(vault, userAddress!)

  const {
    data: userOutputTokenBalance,
    isFetched: isFetchedUserOutputTokenBalance,
    refetch: refetchUserOutputTokenBalance
  } = useTokenBalance(vault.chainId, userAddress!, outputToken?.address!)

  const { refetch: refetchUserVaultTokenBalance } = useUserVaultTokenBalance(vault, userAddress!)

  const { refetch: refetchUserVaultDelegationBalance } = useUserVaultDelegationBalance(
    vault,
    userAddress!
  )

  const { refetch: refetchVaultBalance } = useVaultBalance(vault)

  const formShareAmount = useAtomValue(withdrawFormShareAmountAtom)

  const isValidFormShareAmount =
    vault.decimals !== undefined ? isValidFormInput(formShareAmount, vault.decimals) : false

  const withdrawAmount = isValidFormShareAmount ? parseUnits(formShareAmount, vault.decimals!) : 0n

  const {
    isWaiting: isWaitingApproval,
    isConfirming: isConfirmingApproval,
    isSuccess: isSuccessfulApproval,
    txHash: approvalTxHash,
    sendApproveTransaction: sendApproveTransaction
  } = useSendGenericApproveTransaction(
    vault.chainId,
    vault.address,
    zapTokenManagerAddress,
    withdrawAmount,
    {
      onSuccess: () => {
        refetchTokenAllowance()
        onSuccessfulApproval?.()
      }
    }
  )

  const dataTx = useSendWithdrawZapTransaction(
    { address: outputToken?.address!, decimals: outputToken?.decimals! },
    vault,
    withdrawAmount,
    {
      onSend: () => {
        setModalView('waiting')
      },
      onSuccess: () => {
        refetchUserOutputTokenBalance()
        refetchUserVaultTokenBalance()
        refetchUserVaultDelegationBalance()
        refetchVaultBalance()
        refetchTokenAllowance()
        refetchUserBalances?.()
        onSuccessfulWithdrawalWithZap?.()
        setModalView('success')
      },
      onError: () => {
        setModalView('error')
      }
    }
  )

  const sendTx = dataTx.sendWithdrawZapTransaction
  const isWaitingWithdrawZap = dataTx.isWaiting
  const isConfirmingWithdrawZap = dataTx.isConfirming
  const isSuccessfulWithdrawZap = dataTx.isSuccess
  const withdrawZapTxHash = dataTx.txHash
  const amountOut = dataTx.amountOut
  const isFetchedZapArgs = dataTx.isFetchedZapArgs
  const isFetchingZapArgs = dataTx.isFetchingZapArgs

  useEffect(() => {
    if (
      !!withdrawZapTxHash &&
      isConfirmingWithdrawZap &&
      !isWaitingWithdrawZap &&
      !isSuccessfulWithdrawZap
    ) {
      setWithdrawTxHash(withdrawZapTxHash)
      setModalView('confirming')
    }
  }, [withdrawZapTxHash, isConfirmingWithdrawZap])

  const isDataFetched =
    !isDisconnected &&
    !!userAddress &&
    !!share &&
    !!outputTokenAddress &&
    !!outputToken &&
    isFetchedUserVaultShareBalance &&
    !!userVaultShareBalance &&
    isFetchedUserOutputTokenBalance &&
    userOutputTokenBalance !== undefined &&
    isFetchedAllowance &&
    allowance !== undefined &&
    !!withdrawAmount &&
    outputToken.decimals !== undefined &&
    chain?.id === vault.chainId &&
    isFetchedZapArgs

  const approvalEnabled =
    isDataFetched && userVaultShareBalance.amount >= withdrawAmount && isValidFormShareAmount

  const withdrawEnabled =
    isDataFetched &&
    userVaultShareBalance.amount >= withdrawAmount &&
    allowance >= withdrawAmount &&
    isValidFormShareAmount

  // No withdraw amount set
  if (withdrawAmount === 0n) {
    return (
      <Button color='transparent' fullSized={true} disabled={true}>
        {t_modals('enterAnAmount')}
      </Button>
    )
  }

  // Needs approval
  if (isDataFetched && allowance < withdrawAmount) {
    return (
      <TransactionButton
        chainId={vault.chainId}
        isTxLoading={isWaitingApproval || isConfirmingApproval}
        isTxSuccess={isSuccessfulApproval}
        write={sendApproveTransaction}
        txHash={approvalTxHash}
        txDescription={t_modals('approvalTx', { symbol: share.symbol ?? '?' })}
        fullSized={true}
        disabled={!approvalEnabled}
        addRecentTransaction={addRecentTransaction}
        signInWithWallet={signInWithWallet}
        innerClassName='flex gap-2 items-center'
        intl={{ common: t_common }}
      >
        {t_modals('approvalButton', { symbol: share.symbol ?? '?' })}
        <ApprovalTooltip
          tokenSymbol={share.symbol}
          intl={t_tooltips}
          className='whitespace-normal'
        />
      </TransactionButton>
    )
  }

  // Prompt to review withdrawal
  if (isDataFetched && modalView === 'main') {
    return (
      <Button onClick={() => setModalView('review')} fullSized={true} disabled={!withdrawEnabled}>
        {t_modals('reviewWithdrawal')}
      </Button>
    )
  }

  // Fetching zap args
  if (isFetchingZapArgs) {
    return (
      <Button fullSized={true} disabled={true}>
        {t_modals('findingZapRoute')}
      </Button>
    )
  }

  // Zap route unavailable
  if (!isFetchingZapArgs && !amountOut) {
    return (
      <Button fullSized={true} disabled={true}>
        {t_modals('noZapRouteFound')}
      </Button>
    )
  }

  // Withdraw button
  return (
    <TransactionButton
      chainId={vault.chainId}
      isTxLoading={isWaitingWithdrawZap || isConfirmingWithdrawZap}
      isTxSuccess={isSuccessfulWithdrawZap}
      write={sendTx}
      txHash={withdrawZapTxHash}
      txDescription={t_modals('withdrawTx', { symbol: share?.symbol ?? '?' })}
      fullSized={true}
      disabled={!withdrawEnabled}
      addRecentTransaction={addRecentTransaction}
      signInWithWallet={signInWithWallet}
      intl={{ common: t_common }}
    >
      {t_modals('confirmWithdrawal')}
    </TransactionButton>
  )
}
