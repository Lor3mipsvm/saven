import { useDrawsToCheckForPrizes } from '@generationsoftware/hyperstructure-react-hooks'
import { MODAL_KEYS, useIsModalOpen } from '@shared/generic-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { Card } from '@shared/ui'
import { Button, Spinner } from '@shared/ui'
import { getSimpleDate } from '@shared/utilities'
import classNames from 'classnames'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useSupportedPrizePools } from '@hooks/useSupportedPrizePools'

interface CheckPrizesBannerProps {
  className?: string
}

export const CheckPrizesBanner = (props: CheckPrizesBannerProps) => {
  const { address: userAddress } = useAccount()

  const { setIsModalOpen } = useIsModalOpen(MODAL_KEYS.checkPrizes)

  const t = useTranslations('Account.prizeChecking')

  const prizePools = useSupportedPrizePools()
  const prizePoolsArray = Object.values(prizePools)

  const { data: drawsToCheck, isFetched: isFetchedDrawsToCheck } = useDrawsToCheckForPrizes(
    prizePoolsArray,
    userAddress!
  )

  if (!userAddress) {
    return <></>
  }

  return (
    <div className='relative w-screen flex justify-center gap-8 overflow-hidden mt-2 mb-4'>
      <Card className='w-[calc(100vw-2rem)] shrink-0 lg:w-[38rem] gap-2 text-pt-purple-200'>
        <div className='flex flex-col text-center md:text-start lg:text-base'>
          {isFetchedDrawsToCheck ? (
            !!drawsToCheck?.totalCount ? (
              <>
                <span className='text-lg'>
                  {t('eligibleDraws', { number: drawsToCheck.totalCount })}
                </span>
                <span className='text-sm'>
                  <DateRange timestamps={drawsToCheck.timestamps} className='text-pt-purple-100' />
                </span>
              </>
            ) : (
              <>
                <span>{t('caughtUp')}</span>
                <span className='text-pt-purple-100'>{t('noNewDraws')}</span>
              </>
            )
          ) : (
            <>
              <span>{t('checkingEligibleDraws')}</span>
              <Spinner className='mx-auto mt-1 md:ml-0' />
            </>
          )}
        </div>
        {isFetchedDrawsToCheck && !!drawsToCheck?.totalCount && (
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={!isFetchedDrawsToCheck || !drawsToCheck?.totalCount}
            className='w-100 mx-auto'
          >
            {t('checkPrizes')}
          </Button>
        )}
      </Card>
    </div>
  )
}

interface DateRangeProps {
  timestamps: { start: number; end: number }
  className?: string
}

const DateRange = (props: DateRangeProps) => {
  const { timestamps, className } = props

  const dates = useMemo(() => {
    return {
      start: getSimpleDate(timestamps.start),
      end: getSimpleDate(timestamps.end)
    }
  }, [timestamps])

  return (
    <span className={className}>
      {dates.start === dates.end ? dates.start : `${dates.start} - ${dates.end}`}
    </span>
  )
}
