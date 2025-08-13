'use client'

import { Address, Avatar, EthBalance, Identity, Name } from '@coinbase/onchainkit/identity'
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect
} from '@coinbase/onchainkit/wallet'
import { Button } from '@shared/ui'
import { useTranslations } from 'next-intl'
// import { wagmiConfig } from 'src/utils'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  return (
    <>
      <div className='ock-wallet'>
        <Wallet className='z-10'>
          <ConnectWallet
            text='asd'
            className='bg-pt-teal hover:bg-teal-400 py-2 px-0 text-sm transition'
          >
            <Name className='text-inherit' />
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

      {/* <Button onClick={() => console.log(address)} className='text-xs' size='sm'>
        test
      </Button> */}
    </>
  )
}
