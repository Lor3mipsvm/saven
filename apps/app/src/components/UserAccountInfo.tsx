import { createIcon } from '@download/blockies'
import { useAccount } from '@shared/generic-react-hooks'
import { Spinner } from '@shared/ui'
import { signInDisconnect } from 'src/utils'
import { Address } from 'viem'
import { useWorldUsernameResult } from '@hooks/useWorldUsernameResult'
import './user-info-styles.css'

export const UserAccountInfo = () => {
  const { setUserAddress, address: userAddress } = useAccount()
  const { data: usernameResult, isLoading: usernameResultIsLoading } = useWorldUsernameResult(
    userAddress as Address
  )
  const displayName = !usernameResult?.username
    ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`
    : usernameResult?.username

  const disconnect = () => {
    signInDisconnect(setUserAddress)
  }

  return (
    <>
      <button onClick={disconnect}>
        {!usernameResultIsLoading ? (
          <span className='user-info'>
            {!!usernameResult?.profile_picture_url ? (
              <img src={usernameResult.profile_picture_url} alt='Avatar' />
            ) : (
              <Blockies address={userAddress as Address} />
            )}
            <span>{displayName}</span>
          </span>
        ) : (
          <Spinner />
        )}
      </button>
    </>
  )
}

export type BlockiesProps = {
  address?: Address
}

export const Blockies = (props: BlockiesProps) => {
  const { address } = props
  const seed = address?.toLowerCase()
  const avatar = createIcon({
    seed,
    size: 8,
    scale: 16
  })

  return (
    <span
      title={address}
      className='icon border-2 border-pt-purple-400'
      style={{
        backgroundImage: `url(${avatar.toDataURL()})`
      }}
    />
  )
}
