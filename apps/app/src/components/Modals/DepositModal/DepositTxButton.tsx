import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useSend5792DepositTransaction,
  useTokenAllowance,
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultTokenBalance,
  useVaultBalance,
  useVaultTokenData
} from '@generationsoftware/hyperstructure-react-hooks'
import { TransactionButton } from '@shared/react-components'
import { Button } from '@shared/ui'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { addRecentTransaction } from 'src/utils'
import { Address, Hash, parseUnits } from 'viem'
import { useAccount } from 'wagmi'
import { PAYMASTER_URLS } from '@constants/config'
import { DepositModalView } from '.'
import { isValidFormInput } from '../TxFormInput'
import { depositFormTokenAmountAtom } from './DepositForm'

interface DepositTxButtonProps {
  vault: Vault
  modalView: string
  setModalView: (view: DepositModalView) => void
  setDepositTxHash: (txHash: string) => void
  refetchUserBalances?: () => void
  onSuccessfulApproval?: () => void
  onSuccessfulDeposit?: (chainId: number, txHash: Hash) => void
}

export const DepositTxButton = (props: DepositTxButtonProps) => {
  const {
    vault,
    modalView,
    setModalView,
    setDepositTxHash,
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

  const isUsingEip5792 = true

  const paymasterUrl = PAYMASTER_URLS[vault.chainId]
  const isUsingEip7677 = !!paymasterUrl

  const data5792DepositTx = useSend5792DepositTransaction(depositAmount, vault, {
    paymasterService: isUsingEip7677 ? { url: paymasterUrl, optional: true } : undefined,
    onSend: () => {
      setModalView('waiting')
    },
    onSuccess: (callReceipts) => {
      setTimeout(() => {
        refetchUserTokenBalance()
        refetchUserVaultTokenBalance()
        refetchUserVaultDelegationBalance()
        refetchVaultBalance()
        refetchTokenAllowance()
        refetchUserBalances?.()
      }, 7000)

      onSuccessfulDeposit?.(vault.chainId, callReceipts.at(-1)?.transactionHash!)
      setModalView('success')
    },
    onError: () => {
      setModalView('error')
    },
    enabled: isUsingEip5792
  })

  const isWaitingDeposit = data5792DepositTx.isWaiting
  const isConfirmingDeposit = data5792DepositTx.isConfirming
  const isSuccessfulDeposit = data5792DepositTx.isSuccess
  const depositTxHash = data5792DepositTx.txHashes?.at(-1)
  const sendDepositTransaction = data5792DepositTx.send5792DepositTransaction

  useEffect(() => {
    if (!!depositTxHash && !isWaitingDeposit) {
      setDepositTxHash(depositTxHash)
    }
  }, [depositTxHash, isConfirmingDeposit])

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

  const approvalEnabled =
    isDataFetched && userTokenBalance.amount >= depositAmount && isValidFormTokenAmount

  const depositEnabled =
    isDataFetched &&
    userTokenBalance.amount >= depositAmount &&
    (isUsingEip5792 || allowance >= depositAmount) &&
    isValidFormTokenAmount

  // No deposit amount set
  if (depositAmount === 0n) {
    return (
      <Button color='transparent' fullSized={true} disabled={true}>
        {t_modals('enterAnAmount')}
      </Button>
    )
  }

  // Needs approval
  // if (isDataFetched && !isUsingEip5792 && allowance < depositAmount) {
  //   return (
  //     <TransactionButton
  //       chainId={vault.chainId}
  //       isTxLoading={isWaitingApproval || isConfirmingApproval}
  //       isTxSuccess={isSuccessfulApproval}
  //       write={sendApproveTransaction}
  //       txHash={approvalTxHash}
  //       txDescription={t_modals('approvalTx', { symbol: tokenData?.symbol ?? '?' })}
  //       fullSized={true}
  //       disabled={!approvalEnabled}
  //       addRecentTransaction={addRecentTransaction}
  //       innerClassName='flex gap-2 items-center'
  //       intl={{ common: t_common }}
  //     >
  //       {t_modals('approvalButton', { symbol: tokenData?.symbol ?? '?' })}
  //       <ApprovalTooltip
  //         tokenSymbol={tokenData.symbol}
  //         intl={t_tooltips}
  //         className='whitespace-normal'
  //       />
  //     </TransactionButton>
  //   )
  // }

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
      intl={{ common: t_common }}
    >
      {t_modals('confirmDeposit')}
    </TransactionButton>
  )
}
