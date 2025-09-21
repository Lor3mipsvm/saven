import { PrizePool } from '@generationsoftware/hyperstructure-client-js'
import { useGrandPrize } from '@generationsoftware/hyperstructure-react-hooks'
import { useScreenSize, useSelectedCurrency } from '@shared/generic-react-hooks'
import { NetworkBadge, TokenAmount, TokenValue } from '@shared/react-components'
import { Card, Spinner } from '@shared/ui'
import { NETWORK, WRAPPED_NATIVE_ASSETS } from '@shared/utilities'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export interface PrizePoolCardProps {
  prizePool: PrizePool
  className?: string
}

export const PrizePoolCard = (props: PrizePoolCardProps) => {
  const { prizePool, className } = props

  const t_common = useTranslations('Common')

  const { data: grandPrize, isFetched: isFetchedGrandPrize } = useGrandPrize(prizePool, {
    useCurrentPrizeSizes: true
  })

  const { selectedCurrency } = useSelectedCurrency()

  const { isMobile } = useScreenSize()

  const isTokenEquivalentHidden = useMemo(() => {
    const wethTokenAddress =
      prizePool.chainId === NETWORK.mainnet ||
      prizePool.chainId === NETWORK.optimism ||
      prizePool.chainId === NETWORK.arbitrum ||
      prizePool.chainId === NETWORK.base
        ? WRAPPED_NATIVE_ASSETS[prizePool.chainId]
        : undefined

    return selectedCurrency === 'eth' && grandPrize?.address.toLowerCase() === wethTokenAddress
  }, [prizePool, selectedCurrency])

  return (
    <Card wrapperClassName={className} className='gap-2 items-center md:gap-4'>
      <NetworkBadge chainId={prizePool.chainId} hideBg={isMobile} className='py-0' />
      <div className='h-[8.75rem] flex flex-col gap-0.5 items-center text-center text-pt-purple-200 font-averta'>
        <span className='text-2xl'>{t_common('grandPrize')}</span>
        {isFetchedGrandPrize ? (
          !!grandPrize ? (
            <>
              <span className='text-6xl text-pt-teal font-bold'>
                <TokenValue token={grandPrize} hideZeroes={true} fallback={<></>} />
              </span>
              {!isTokenEquivalentHidden && (
                <span className='text-2xl font-lighter text-pt-purple-300'>
                  ≈ <TokenAmount token={grandPrize} maximumFractionDigits={2} />
                </span>
              )}
            </>
          ) : (
            '?'
          )
        ) : (
          <Spinner className='my-auto' />
        )}
      </div>
    </Card>
  )
}
