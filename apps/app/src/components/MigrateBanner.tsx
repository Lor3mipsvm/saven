import { useUserVaultShareBalance, useVault } from '@generationsoftware/hyperstructure-react-hooks'
import { useAccount } from '@shared/generic-react-hooks'
import { Card } from '@shared/ui'
import { NETWORK } from '@shared/utilities'
import { formatUnits } from 'viem'
import { Address } from 'viem'
import { MigrateTxButton } from './MigrateTxButton'

export const MigrateBanner = () => {
  const { address: userAddress } = useAccount()

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
          <span className='font-bold text-teal-200'>Notice:</span> Migration Required
        </h4>
        <p className='flex flex-col text-center'>
          Previous Vault Balance:{' '}
          <span className='font-bold'>
            {userVaultShareBalance?.amount &&
              formatUnits(
                userVaultShareBalance?.amount as bigint,
                userVaultShareBalance?.decimals as number
              )}{' '}
            WLD
          </span>
        </p>
        <p className='flex flex-col text-center font-semibold text-yellow-200'>
          To continue winning prizes, you need to migrate your deposit to the new vault:
        </p>
        <MigrateTxButton />
      </Card>
    </div>
  )

  // TODO: Switch to if conditional below before going live !
  if (isFetchedUserVaultShareBalance) {
    return banner
  }
  // if (
  //   isFetchedUserVaultShareBalance &&
  //   userVaultShareBalance?.amount &&
  //   userVaultShareBalance?.amount > 0n
  // ) {
  //   return banner
  // }
}
