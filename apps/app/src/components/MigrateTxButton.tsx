import {
  useTokenBalance,
  useUserVaultDelegationBalance,
  useUserVaultShareBalance,
  useUserVaultTokenBalance,
  useVault,
  useVaultBalance,
  useVaultTokenAddress,
  useVaultTokenData,
  useWorldPublicClient
} from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { TransactionButton } from '@shared/react-components'
import { NETWORK } from '@shared/utilities'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  decodeDepositEvent,
  withdrawAndDeposit,
  type WithdrawAndDepositTxOptions
} from 'src/minikit_txs'
import { addRecentTransaction, signInWithWallet } from 'src/utils'
import { Address, Hash } from 'viem'

interface MigrateTxButtonProps {
  refetchUserBalances?: () => void
  onSuccessfulDeposit?: (chainId: number, txHash: Hash, shares: bigint) => void
}

export const MigrateTxButton = (props: MigrateTxButtonProps) => {
  const { refetchUserBalances, onSuccessfulDeposit } = props

  const oldWldVaultAddress = '0x8ad5959c9245b64173d4c0c3cd3ff66dac3cab0e'
  // TODO: Update this to the actual new one after it's deployed!
  const newWldVaultAddress = '0x8ad5959c9245b64173d4c0c3cd3ff66dac3cab0e'

  const withdrawVault = useVault({ chainId: NETWORK.world, address: oldWldVaultAddress })
  const depositVault = useVault({ chainId: NETWORK.world, address: newWldVaultAddress })

  const t_common = useTranslations('Common')
  const t_modals = useTranslations('TxModals')

  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false)

  const [migrateTxHash, setMigrateTxHash] = useState<string>()

  const { address: userAddress, chain, isDisconnected } = useAccount()

  const { data: tokenData } = useVaultTokenData(withdrawVault)

  const { data: userVaultShareBalance, isFetched: isFetchedUserVaultShareBalance } =
    useUserVaultShareBalance(withdrawVault, userAddress as Address)
  const amount = userVaultShareBalance?.amount as bigint

  const { refetch: refetchUserVaultTokenBalance } = useUserVaultTokenBalance(
    withdrawVault,
    userAddress as Address
  )

  const { refetch: refetchUserTokenBalance } = useTokenBalance(
    withdrawVault.chainId,
    userAddress as Address,
    tokenData?.address as Address
  )

  const { refetch: refetchUserVaultDelegationBalance } = useUserVaultDelegationBalance(
    withdrawVault,
    userAddress as Address
  )

  const { refetch: refetchVaultBalance } = useVaultBalance(withdrawVault)

  const options: WithdrawAndDepositTxOptions = {
    onSend: () => {
      setIsConfirming(true)
    },
    onSuccess: (decodedEventLogs: ReturnType<typeof decodeDepositEvent>, txHash: Address) => {
      setIsSuccessful(true)
      onSuccessfulDeposit?.(depositVault.chainId, txHash, decodedEventLogs?.args?.shares)

      refetchUserTokenBalance()
      refetchUserVaultTokenBalance()
      refetchUserVaultDelegationBalance()
      refetchVaultBalance()
      refetchUserBalances?.()

      setMigrateTxHash(txHash)
    },
    onSettled: () => {
      setIsConfirming(false)
    },
    onError: () => {
      setIsConfirming(false)
      setIsSuccessful(false)
    }
  }
  const { data: tokenAddress, isFetched: isFetchedTokenAddress } =
    useVaultTokenAddress(depositVault)

  const publicClient = useWorldPublicClient()

  const sendMigrateTransaction = () =>
    withdrawAndDeposit(
      amount,
      publicClient,
      userAddress as Address,
      withdrawVault.address,
      depositVault.address,
      tokenAddress as Address,
      options
    )

  // TODO: Switch to if conditional below before going live !
  const migrateEnabled =
    !isDisconnected &&
    !!userAddress &&
    !!tokenData &&
    isFetchedUserVaultShareBalance &&
    !!sendMigrateTransaction

  // const migrateEnabled =
  //   !isDisconnected &&
  //   !!userAddress &&
  //   !!tokenData &&
  //   isFetchedUserVaultShareBalance &&
  //   !!userVaultShareBalance &&
  //   !!amount &&
  //   userVaultShareBalance.amount >= amount &&
  //   !!sendMigrateTransaction

  return (
    <TransactionButton
      chainId={withdrawVault.chainId}
      isTxLoading={isConfirming}
      isTxSuccess={isSuccessful}
      write={sendMigrateTransaction}
      txHash={migrateTxHash}
      txDescription={t_modals('migrateTx', { symbol: tokenData?.symbol ?? '?' })}
      fullSized={true}
      disabled={!migrateEnabled}
      addRecentTransaction={addRecentTransaction}
      signInWithWallet={signInWithWallet}
      intl={{ common: t_common }}
    >
      {t_common('migrateNow')}
    </TransactionButton>
  )
}
