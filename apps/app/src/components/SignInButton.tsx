// import { useAccount } from '@shared/generic-react-hooks'
import { Button } from '@shared/ui'
import { useTranslations } from 'next-intl'
// import { signInWithWallet } from 'src/utils'
import { wagmiConfig } from 'src/utils'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  // const { setUserAddress } = useAccount()
  console.log('address')
  console.log(address)
  console.log(wagmiConfig.connectors[0])

  return (
    <>
      <Button
        onClick={() =>
          isConnected ? disconnect() : connect({ connector: wagmiConfig.connectors[0] })
        }
        className='text-xs'
        size='sm'
      >
        {t_common('signIn')}
      </Button>
    </>
  )
}
