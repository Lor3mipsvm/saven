import { useAccount } from '@shared/generic-react-hooks'
import { Button } from '@shared/ui'
import { useTranslations } from 'next-intl'
import { signInDisconnect, signInWithWallet } from 'src/utils'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  const { setUserAddress } = useAccount()

  return (
    <>
      <Button
        onClick={() => {
          signInWithWallet(setUserAddress)
        }}
        className='text-xs'
        size='sm'
      >
        {t_common('signIn')}
      </Button>
    </>
  )
}
