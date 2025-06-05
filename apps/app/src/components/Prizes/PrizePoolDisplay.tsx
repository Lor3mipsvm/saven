import { useSelectedVault, useSelectedVaults } from '@generationsoftware/hyperstructure-react-hooks'
import { ExternalLink } from '@shared/ui'
import { LINKS, NETWORK } from '@shared/utilities'
import classNames from 'classnames'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSupportedPrizePools } from '@hooks/useSupportedPrizePools'
import { PrizePoolPrizesCard } from './PrizePoolPrizesCard'

interface PrizePoolDisplayProps {
  onNetworkChange?: (chainId: NETWORK) => void
  className?: string
}

export const PrizePoolDisplay = (props: PrizePoolDisplayProps) => {
  const { onNetworkChange, className } = props

  const t = useTranslations('Prizes')

  return (
    <div className={classNames('flex flex-col items-center text-center', className)}>
      <span className='text-2xl font-averta text-pt-teal-dark font-medium md:text-4xl'>
        {t('currentPrizes')}
      </span>
      <PrizePoolCarousel onNetworkChange={onNetworkChange} className='mt-8 mb-4' />
      <span>
        *
        {t.rich('learnMore', {
          link: (chunks) => (
            <ExternalLink
              href={LINKS.protocolBasicsDocs}
              size='xs'
              className='text-pt-purple-200 md:text-base'
              iconClassName='md:h-5 md:w-5'
            >
              {chunks}
            </ExternalLink>
          )
        })}
      </span>
    </div>
  )
}

interface PrizePoolCarouselProps {
  onNetworkChange?: (chainId: NETWORK) => void
  className?: string
}

// TODO: animate between different prize pools
const PrizePoolCarousel = (props: PrizePoolCarouselProps) => {
  const { onNetworkChange, className } = props

  const searchParams = useSearchParams()

  // TODO: should ideally highlight the largest prize pool if no network is set by searchParams
  const [prizePoolIndex, setPrizePoolIndex] = useState<number>(0)

  const prizePools = useSupportedPrizePools()
  const prizePoolsArray = Object.values(prizePools)

  const { vaults } = useSelectedVaults()
  const { setSelectedVaultById } = useSelectedVault()

  const handleNetworkChange = (chainId: number) => {
    if (!!chainId && chainId in NETWORK) {
      const vaultsArray = Object.values(vaults.vaults)
      const firstVaultInChain = vaultsArray.find((vault) => vault.chainId === chainId)
      !!firstVaultInChain && setSelectedVaultById(firstVaultInChain.id)
      onNetworkChange?.(chainId)
    }
  }

  useEffect(() => {
    const rawUrlNetwork = searchParams?.get('network')
    const chainId =
      !!rawUrlNetwork && typeof rawUrlNetwork === 'string' ? parseInt(rawUrlNetwork) : undefined

    if (!!chainId) {
      handleNetworkChange(chainId)
      const prizePoolIndex = prizePoolsArray.findIndex((pool) => pool.chainId === chainId)
      prizePoolIndex !== -1 && setPrizePoolIndex(prizePoolIndex)
    }
  }, [searchParams])

  useEffect(() => {
    const chainId = prizePoolsArray[prizePoolIndex]?.chainId
    !!chainId && handleNetworkChange(chainId)
  }, [prizePoolIndex])


  return (
    <div
      className={classNames(
        'relative w-screen flex justify-center gap-8 overflow-hidden',
        className
      )}
    >
      <PrizePoolPrizesCard
        prizePool={prizePoolsArray[prizePoolIndex]}
        className='w-[calc(100vw-4rem)] shrink-0 lg:w-[38rem]'
      />
    </div>
  )
}
