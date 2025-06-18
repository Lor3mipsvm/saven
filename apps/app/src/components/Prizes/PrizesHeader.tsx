import { useAllPrizeValue } from '@generationsoftware/hyperstructure-react-hooks'
import { CurrencyValue } from '@shared/react-components'
import { Button } from '@shared/ui'
import { Spinner } from '@shared/ui'
import classNames from 'classnames'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSupportedPrizePools } from '@hooks/useSupportedPrizePools'

export const PrizesHeader = () => {
  const t_prizes = useTranslations('Prizes')
  const t_common = useTranslations('Common')

  const prizePools = useSupportedPrizePools()
  const prizePoolsArray = Object.values(prizePools)

  const { data: allPrizeValue, isFetched: isFetchedAllPrizeValue } =
    useAllPrizeValue(prizePoolsArray)
  const totalPrizeValue = isFetchedAllPrizeValue
    ? Object.values(allPrizeValue).reduce((a, b) => a + b, 0)
    : undefined

  const TotalPrizeValue = () => (
    <span className='ml-0 text-pt-teal text-4xl'>
      {!!totalPrizeValue ? (
        <CurrencyValue baseValue={totalPrizeValue} hideZeroes={true} countUp={true} />
      ) : (
        <Spinner />
      )}
    </span>
  )

  return (
    <>
      <div className='flex flex-col items-center gap-3'>
        {/* <img src='/partyPopperEmoji.svg' alt='Cabana Party Popper Emoji' width={88} height={88} /> */}
        <span
          className={classNames(
            'px-4 flex flex-wrap justify-center text-center text-[1.75rem] leading-tight font-averta font-bold',
            'md:w-full md:text-4xl lg:text-5xl flex flex-col'
          )}
        >
          {t_prizes.rich('keepYourDeposit')}
          <br />
          {t_prizes.rich('winUpTo', { amount: () => <TotalPrizeValue className='ml-0' /> })}
        </span>
        <Link href={`/vaults`} passHref={true}>
          <Button>{t_common('depositToWin')}</Button>
        </Link>
        {/* TODO: add animated text with recent big winners (need luck script/calc) */}
      </div>
    </>
  )
}
