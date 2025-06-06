import { useAccount } from '@shared/generic-react-hooks'
import { Spinner } from '@shared/ui'
// import { useTranslations } from 'next-intl'
import './user-info-styles.css'

export const UserAccountInfo = () => {
  const { address: userAddress } = useAccount()
  const usernameResult = {
    error: false,
    username: 'Daphne',
    profile_picture_url:
      'https://pbs.twimg.com/profile_images/1524137508904353793/3aBrb_wM_400x400.jpg'
  }
  const displayName = usernameResult.error
    ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`
    : usernameResult?.username

  const disconnect = () => {
    alert('run disconnect')
  }

  return (
    <>
      <button onClick={disconnect}>
        {displayName ? (
          <span className='user-info'>
            {!!usernameResult?.profile_picture_url ? (
              <img src={usernameResult.profile_picture_url} alt='Avatar' />
            ) : (
              'icon'
              // <Blockies address={$userAddress} />
            )}
            <span>{displayName}</span>
          </span>
        ) : (
          <Spinner />
          // <Loading color='#8050e3' height='0.5rem' />
        )}
      </button>
    </>
  )
}
