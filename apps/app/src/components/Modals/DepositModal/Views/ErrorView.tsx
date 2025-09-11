import { ErrorPooly } from '@shared/react-components'
import { Button } from '@components/ui/button'
import { useTranslations } from 'next-intl'
import { DepositModalView } from '..'

interface ErrorViewProps {
  setModalView: (view: DepositModalView) => void
}

export const ErrorView = (props: ErrorViewProps) => {
  const { setModalView } = props

  const t = useTranslations('TxModals')

  return (
    <div className='flex flex-col gap-6 items-center'>
      <div className='flex flex-col items-center text-lg font-semibold text-center'>
        <span className='text-[#EA8686]'>{t('uhOh')}</span>
        <span>{t('failedTx')}</span>
      </div>
      <ErrorPooly className='w-40 h-auto' />
      <Button
        className="w-full md:mt-32"
        color='transparent'
        onClick={() => setModalView('main')}
      >
        {t('tryAgain')}
      </Button>
    </div>
  )
}
