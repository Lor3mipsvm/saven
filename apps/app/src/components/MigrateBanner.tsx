import { useUserVaultShareBalance, useVault } from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { Card } from '@shared/ui'
import { NETWORK } from '@shared/utilities'
import { useTranslations } from 'next-intl'
import { formatUnits } from 'viem'
import { Address } from 'viem'
import { MigrateTxButton } from './MigrateTxButton'

export const MigrateBanner = () => {
  const { address: userAddress } = useAccount()

  const t_common = useTranslations('Common')

  const oldWldVaultAddress = '0x8ad5959c9245b64173d4c0c3cd3ff66dac3cab0e'
  const vault = useVault({ chainId: NETWORK.world, address: oldWldVaultAddress })

  const { data: userVaultShareBalance, isFetched: isFetchedUserVaultShareBalance } =
    useUserVaultShareBalance(vault, userAddress as Address)

  if (!userAddress) {
    return <></>
  }

  const banner = (
    <div className='relative w-screen flex justify-center gap-8 overflow-hidden mt-2 mb-4'>
      <Card
        wrapperClassName='bg-pt-purple-500'
        className='w-[calc(100vw-2rem)] shrink-0 lg:w-[38rem] gap-2 text-pt-purple-200'
      >
        <h4 className='text-center text-xl text-white'>
          <span className='font-bold text-teal-200'>{t_common('notice')}:</span>{' '}
          {t_common('migrationRequired')}
        </h4>
        <p className='text-sm text-center'>
          <span className='text-pt-purple-100 text-opacity-100'>
            {t_common('oldVaultBalance')}:
          </span>{' '}
          {/* <span className='font-bold'> */}
          {userVaultShareBalance?.amount &&
            formatUnits(
              userVaultShareBalance?.amount as bigint,
              userVaultShareBalance?.decimals as number
            )}{' '}
          WLD
          {/* </span> */}
        </p>
        <p className='flex flex-col text-center font-semibold text-yellow-200'>
          {t_common('toContinueWinning')}:
        </p>
        <span className='my-1'>
          <MigrateTxButton />
        </span>
      </Card>
    </div>
  )

  if (
    isFetchedUserVaultShareBalance &&
    userVaultShareBalance?.amount &&
    userVaultShareBalance?.amount > 0n
  ) {
    return banner
  }
}
