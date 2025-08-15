import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSendDepositZapTransaction,
  useSendGenericApproveTransaction,
  useToken,
  useTokenAllowance,
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultTokenBalance,
  useVaultBalance,
  useVaultTokenAddress
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { TransactionButton } from '@shared/react-components'
import { Button } from '@shared/ui'
import { DOLPHIN_ADDRESS, lower, ZAP_SETTINGS } from '@shared/utilities'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { addRecentTransaction } from 'src/utils'
import { Hash, isAddress, parseUnits } from 'viem'
import { DepositModalView } from '.'
import { isValidFormInput } from '../TxFormInput'
import { depositFormTokenAddressAtom, depositFormTokenAmountAtom } from './DepositForm'

interface DepositZapTxButtonProps {
  vault: Vault
  modalView: string
  setModalView: (view: DepositModalView) => void
  setDepositTxHash: (txHash: string) => void
  refetchUserBalances?: () => void
  onSuccessfulApproval?: () => void
  onSuccessfulDepositWithZap?: (chainId: number, txHash: Hash) => void
}

export const DepositZapTxButton = (props: DepositZapTxButtonProps) => {
  const {
    vault,
    modalView,
    setModalView,
    setDepositTxHash,
    refetchUserBalances,
    onSuccessfulApproval,
    onSuccessfulDepositWithZap
  } = props

  const t_common = useTranslations('Common')
  const t_modals = useTranslations('TxModals')

  const { address: userAddress, chain, isDisconnected } = useAccount()

  const formInputTokenAddress = useAtomValue(depositFormTokenAddressAtom)

  const { data: vaultTokenAddress } = useVaultTokenAddress(vault)

  const inputTokenAddress =
    !!formInputTokenAddress && isAddress(formInputTokenAddress)
      ? formInputTokenAddress
      : vaultTokenAddress

  const { data: inputToken } = useToken(vault.chainId, inputTokenAddress!)

  const zapTokenManagerAddress = ZAP_SETTINGS[vault.chainId]?.zapTokenManager

  const {
    data: allowance,
    isFetched: isFetchedAllowance,
    refetch: refetchTokenAllowance
  } = useTokenAllowance(vault.chainId, userAddress!, zapTokenManagerAddress, inputToken?.address!)

  const {
    data: userInputTokenBalance,
    isFetched: isFetchedUserInputTokenBalance,
    refetch: refetchUserInputTokenBalance
  } = useTokenBalance(vault.chainId, userAddress!, inputToken?.address!)

  const { refetch: refetchUserVaultTokenBalance } = useUserVaultTokenBalance(vault, userAddress!)

  const { refetch: refetchUserVaultDelegationBalance } = useUserVaultDelegationBalance(
    vault,
    userAddress!
  )

  const { refetch: refetchVaultBalance } = useVaultBalance(vault)

  const formInputTokenAmount = useAtomValue(depositFormTokenAmountAtom)

  const isValidFormInputTokenAmount =
    !!inputToken && inputToken.decimals !== undefined
      ? isValidFormInput(formInputTokenAmount, inputToken.decimals)
      : false

  const depositAmount = isValidFormInputTokenAmount
    ? parseUnits(formInputTokenAmount, inputToken?.decimals!)
    : 0n

  const dataTx = useSendDepositZapTransaction(
    {
      address: inputToken?.address!,
      decimals: inputToken?.decimals!,
      amount: depositAmount
    },
    vault,
    {
      onSend: () => {
        setModalView('waiting')
      },
      onSuccess: (txReceipt) => {
        refetchUserInputTokenBalance()
        refetchUserVaultTokenBalance()
        refetchUserVaultDelegationBalance()
        refetchVaultBalance()
        refetchTokenAllowance()
        refetchUserBalances?.()
        onSuccessfulDepositWithZap?.(vault.chainId, txReceipt.transactionHash)
        setModalView('success')
      },
      onError: () => {
        setModalView('error')
      }
    }
  )

  const sendTx = dataTx.sendDepositZapTransaction
  const isWaitingDepositZap = dataTx.isWaiting
  const isConfirmingDepositZap = dataTx.isConfirming
  const isSuccessfulDepositZap = dataTx.isSuccess
  const depositZapTxHash = dataTx.txHash
  const amountOut = dataTx.amountOut
  const isFetchedZapArgs = dataTx.isFetchedZapArgs
  const isFetchingZapArgs = dataTx.isFetchingZapArgs

  useEffect(() => {
    if (
      !!depositZapTxHash &&
      isConfirmingDepositZap &&
      !isWaitingDepositZap &&
      !isSuccessfulDepositZap
    ) {
      setDepositTxHash(depositZapTxHash)
      setModalView('confirming')
    }
  }, [depositZapTxHash, isConfirmingDepositZap])

  const isDataFetched =
    !isDisconnected &&
    !!userAddress &&
    !!inputTokenAddress &&
    !!inputToken &&
    isFetchedUserInputTokenBalance &&
    !!userInputTokenBalance &&
    isFetchedAllowance &&
    allowance !== undefined &&
    !!depositAmount &&
    inputToken.decimals !== undefined &&
    chain?.id === vault.chainId &&
    isFetchedZapArgs

  const depositEnabled =
    isDataFetched &&
    userInputTokenBalance.amount >= depositAmount &&
    (lower(inputTokenAddress) === DOLPHIN_ADDRESS || allowance >= depositAmount) &&
    isValidFormInputTokenAmount

  // No deposit amount set
  if (depositAmount === 0n) {
    return (
      <Button color='transparent' fullSized={true} disabled={true}>
        {t_modals('enterAnAmount')}
      </Button>
    )
  }

  // Prompt to review deposit
  if (isDataFetched && modalView === 'main') {
    return (
      <Button onClick={() => setModalView('review')} fullSized={true} disabled={!depositEnabled}>
        {t_modals('reviewDeposit')}
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

  // Deposit button
  return (
    <TransactionButton
      chainId={vault.chainId}
      isTxLoading={isWaitingDepositZap || isConfirmingDepositZap}
      isTxSuccess={isSuccessfulDepositZap}
      write={sendTx}
      txHash={depositZapTxHash}
      txDescription={t_modals('depositTx', { symbol: inputToken?.symbol ?? '?' })}
      fullSized={true}
      disabled={!depositEnabled}
      addRecentTransaction={addRecentTransaction}
      intl={{ common: t_common }}
    >
      {t_modals('confirmDeposit')}
    </TransactionButton>
  )
}
