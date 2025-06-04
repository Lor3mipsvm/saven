import { Button, ButtonProps } from '@shared/ui'
import { useTranslations } from 'next-intl'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  function signInWithWallet() {}

  return (
    <>
      <Button onClick={signInWithWallet} className='text-xs' size='sm'>
        {t_common('signIn')}
      </Button>
    </>
  )
}
