import { Button } from '@shared/ui'
import { useTranslations } from 'next-intl'
import { signInWithWallet } from 'src/utils'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  return (
    <>
      <Button onClick={signInWithWallet} className='text-xs' size='sm'>
        {t_common('signIn')}
      </Button>
    </>
  )
}
