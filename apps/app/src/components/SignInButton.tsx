import { Button, ButtonProps } from '@shared/ui'
import { MiniKit } from '@worldcoin/minikit-js'
import { useTranslations } from 'next-intl'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  const signInWithWallet = () => {
    if (!MiniKit.isInstalled()) {
      // toast.dismiss()
      // toast.error(
      //   `Failed !MiniKit.isInstalled(), make sure you're running this miniapp inside of the World Mobile App`,
      //   {
      //     duration: 8000,
      //     style: 'border: 2px solid var(--pt-warning-med); '
      //   }
      // )
      console.log('failed !MiniKit.isInstalled()')
      return
    } else {
      console.log('signin')
    }
  }

  return (
    <>
      <Button onClick={signInWithWallet} className='text-xs' size='sm'>
        {t_common('signIn')}
      </Button>
    </>
  )
}
