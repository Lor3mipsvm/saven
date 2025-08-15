'use client'

import { Address, Avatar, EthBalance, Identity, Name } from '@coinbase/onchainkit/identity'
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect
} from '@coinbase/onchainkit/wallet'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Button } from '@shared/ui'
import { useTranslations } from 'next-intl'
import { useAccount } from 'wagmi'

export const SignInButton = () => {
  const t_common = useTranslations('Common')
  const { address } = useAccount()

  return (
    <>
      <div className='ock-wallet'>
        <Wallet className='z-10'>
          <ConnectWallet
            text={t_common('connectWallet')}
            className={
              !!address
                ? 'bg-pt-purple-400 hover:bg-pt-purple-300 py-2 px-4 text-sm transition font-normal font-averta'
                : 'bg-pt-teal hover:bg-teal-400 py-2 px-0 text-sm transition font-normal font-averta'
            }
          >
            <Name className='text-inherit' />
            <ChevronDownIcon className='h-5 w-5' />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className='px-4 pt-3 pb-2'>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      <Button onClick={() => console.log(address)} className='text-xs' size='sm'>
        test
      </Button>
    </>
  )
}
