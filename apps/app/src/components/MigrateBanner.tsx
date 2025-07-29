import { useAccount } from '@shared/generic-react-hooks'
import { Card } from '@shared/ui'
import { getSimpleDate } from '@shared/utilities'
import { useMemo } from 'react'
import { MigrateTxButton } from './MigrateTxButton'

export const MigrateBanner = () => {
  const { address: userAddress } = useAccount()

  if (!userAddress) {
    return <></>
  }

  return (
    <div className='relative w-screen flex justify-center gap-8 overflow-hidden mt-2 mb-4'>
      <Card
        wrapperClassName='bg-pt-purple-500'
        className='w-[calc(100vw-2rem)] shrink-0 lg:w-[38rem] gap-2 text-pt-purple-200'
      >
        <div className='flex flex-col text-center md:text-start lg:text-base'>
          To continue winning prizes you will need to migrate your deposit to the new vault:
        </div>
        <MigrateTxButton
        // disabled={!isFetchedDrawsToCheck || !drawsToCheck?.totalCount}
        // className='w-100 mx-auto'
        />
      </Card>
    </div>
  )
}
