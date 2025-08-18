import { Spinner } from '@shared/ui'
import BlockiesSvg from 'blockies-react-svg'
// import { signInDisconnect } from 'src/utils'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import './user-info-styles.css'

export const UserAccountInfo = () => {
  const { setUserAddress, address } = useAccount()

  const usernameResult = {
    username: 'usssernammme',
    profile_picture_url: 'https://framerusercontent.com/images/A1hs7ZPjVbb3O6sC17sdztouPE.png'
  }
  const usernameResultIsLoading = false

  const displayName = !usernameResult?.username
    ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
    : usernameResult?.username

  // const disconnect = () => {
  //   signInDisconnect(setUserAddress)
  // }

  return (
    <>
      {address}
      {/* <button onClick={disconnect}>
        {!usernameResultIsLoading ? (
          <span className='user-info'>
            {!!usernameResult?.profile_picture_url ? (
              <img src={usernameResult.profile_picture_url} alt='Avatar' />
            ) : (
              <Blockies address={address as Address} />
            )}
            <span>{displayName}</span>
          </span>
        ) : (
          <Spinner />
        )}
      </button> */}
    </>
  )
}

export type BlockiesProps = {
  address?: Address
}

export const Blockies = (props: BlockiesProps) => {
  const { address } = props

  return (
    <BlockiesSvg
      address={address?.toString() || '0x'}
      size={8}
      scale={16}
      className='icon border-2 border-pt-purple-400'
    />
  )
}
