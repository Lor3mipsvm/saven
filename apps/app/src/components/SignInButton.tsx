'use client'

import { Wallet } from '@coinbase/onchainkit/wallet'
import { Button } from '@shared/ui'
import { useTranslations } from 'next-intl'
import { wagmiConfig } from 'src/utils'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  // const { setUserAddress } = useAccount()
  console.log('isConnected')
  console.log(isConnected)
  console.log('address')
  console.log(address)
  // console.log(wagmiConfig.connectors[0])
  // console.log(connect)

  return (
    <>
      <Wallet />

      <Button onClick={() => console.log(address)} className='text-xs' size='sm'>
        test
      </Button>

      {/* <Button
        onClick={() =>
          isConnected ? disconnect() : connect({ connector: wagmiConfig.connectors[0] })
        }
        className='text-xs'
        size='sm'
      >
        {t_common('signIn')}
      </Button> */}
    </>
  )
}
