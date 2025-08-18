import {
  useAllUserVaultBalances,
  useSelectedVaults
} from '@generationsoftware/hyperstructure-react-hooks'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { MODAL_KEYS, useIsModalOpen } from '@shared/generic-react-hooks'
// import { useAccount } from 'wagmi'
import { Button } from '@shared/ui'
import classNames from 'classnames'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useMemo } from 'react'
// import { signInWithWallet } from 'src/utils'
import { Address } from 'viem'
import { useAccount, useConnect } from 'wagmi'
import { PrizePoolCards } from '@components/Prizes/PrizePoolCards'
import { useSettingsModalView } from '@hooks/useSettingsModalView'
import { AccountDepositsCards } from './AccountDepositsCards'
import { AccountDepositsHeader } from './AccountDepositsHeader'
import { AccountDepositsTable } from './AccountDepositsTable'

interface AccountDepositsProps {
  address?: Address
  className?: string
}

export const AccountDeposits = (props: AccountDepositsProps) => {
  const { address, className } = props

  const { address: _userAddress } = useAccount()
  const userAddress = address ?? _userAddress

  const { vaults } = useSelectedVaults()

  const { data: vaultBalances } = useAllUserVaultBalances(vaults, userAddress as Address)

  const isEmpty = useMemo(() => {
    return !!vaultBalances && Object.values(vaultBalances).every((token) => token.amount === 0n)
  }, [vaultBalances])

  const isExternalUser = useMemo(() => {
    return !!address && address.toLowerCase() !== _userAddress?.toLowerCase()
  }, [address, _userAddress])

  if (typeof window !== 'undefined' && !userAddress) {
    return (
      <div className='w-full flex flex-col items-center gap-8'>
        <NoWalletCard />
        <PrizePoolCards />
      </div>
    )
  }

  const isEmptyVaultLists = !vaults.allVaultInfo.length

  return (
    <div
      className={classNames(
        'w-full max-w-xl flex flex-col gap-2 items-center md:gap-4 lg:max-w-none',
        className
      )}
    >
      <AccountDepositsHeader address={userAddress} />
      {isEmpty && !isEmptyVaultLists && !isExternalUser && <NoDepositsCard />}
      {!isEmpty && <AccountDepositsTable address={userAddress} className='hidden mt-4 lg:block' />}
      {!isEmpty && <AccountDepositsCards address={userAddress} className='lg:hidden' />}
    </div>
  )
}

const NoWalletCard = (props: { className?: string }) => {
  const { className } = props

  const t_common = useTranslations('Common')
  const t_account = useTranslations('Account')

  // const { setUserAddress } = useAccount()

  // const { openConnectModal } = useConnectModal()

  const { address: accountAddress, status, connector: accountConnector } = useAccount()
  const { connectors, connect, status: connectStatus } = useConnect()

  // Wallet connect status
  const connector = accountConnector || connectors[0]
  const isLoading = connectStatus === 'pending' || status === 'connecting'

  return (
    <div className={classNames('flex flex-col max-w-md gap-6 items-center', className)}>
      <span className='text-center text-3xl md:text-5xl'>{t_account('connectWallet')}</span>

      <Button
        onClick={() => {
          connect(
            { connector },
            {
              onSuccess: () => {
                // onConnect?.()
                // handleAnalyticsSuccess(accountAddress)
              },
              onError: (error) => {
                // handleAnalyticsError(error.message, 'ConnectWallet')
              }
            }
          )
        }}
      >
        <div className='inline-flex gap-3 font-averta font-normal font-medium'>
          <span>{t_common('connectWallet')}</span>
          <ArrowRightIcon className='h-5 w-5' />
        </div>
      </Button>
    </div>
  )
}

const NoDepositsCard = (props: { className?: string }) => {
  const { className } = props

  const t = useTranslations('Account')

  return (
    <div className={classNames('w-full rounded-lg lg:p-4 lg:bg-pt-purple-600', className)}>
      <div className='flex flex-col w-full gap-2 items-center justify-center p-3 text-sm bg-pt-transparent rounded-lg lg:flex-row lg:gap-3 lg:text-lg lg:font-medium'>
        <span className='text-pt-purple-100'>{t('noPrizeTokens')}</span>
        <Link href='/vaults' className='text-pt-teal'>
          {t('depositNow')}
        </Link>
      </div>
    </div>
  )
}
