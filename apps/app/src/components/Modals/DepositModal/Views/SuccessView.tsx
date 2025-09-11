import { Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useVaultShareData,
  useVaultTokenData
} from '@generationsoftware/hyperstructure-react-hooks'
import { PrizePoolBadge, SocialShareButton, SuccessPooly } from '@shared/react-components'
import { Token } from '@shared/types'
import { Skeleton } from '@components/ui/skeleton'
import {
  erc20ABI,
  formatBigIntForDisplay,
  getBlockExplorerName,
  getBlockExplorerUrl,
  getNiceNetworkNameByChainId,
  lower
} from '@shared/utilities'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import ConfettiExplosion from 'react-confetti-explosion'
import { Address, decodeEventLog, TransactionReceipt } from 'viem'
import { useAccount } from 'wagmi'
import { useTransactionReceipt } from 'wagmi'
import { ComposeCastButton } from '@components/ComposeCastButton'
import { ExternalLink } from '@components/ExternalLink'

interface SuccessViewProps {
  vault: Vault
  txHash?: string
}

export const SuccessView = (props: SuccessViewProps) => {
  const { vault, txHash } = props

  const t_common = useTranslations('Common')
  const t_modals = useTranslations('TxModals')

  const { address: userAddress } = useAccount()

  const { data: share } = useVaultShareData(vault)

  const { data: txReceipt } = useTransactionReceipt({
    chainId: vault.chainId,
    hash: txHash as `0x${string}`
  })

  const sharesReceived = useMemo(() => {
    if (!!userAddress && !!share && !!txReceipt) {
      return getSharesReceived(userAddress, share, txReceipt)
    }
  }, [userAddress, share, txReceipt])

  const formattedSharesReceived =
    !!share && !!sharesReceived
      ? formatBigIntForDisplay(sharesReceived, share.decimals, { maximumFractionDigits: 5 })
      : '?'
  const tokens = `${formattedSharesReceived} ${share?.symbol}`
  const name = getBlockExplorerName(vault.chainId)

  const [isExploding, setIsExploding] = useState<boolean>(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExploding(true)
    }, 1000)

    return () => clearTimeout(timer)
  })

  return (
    <div className='flex flex-col gap-6 items-center'>
      <div className='text-center mx-auto'>
        {isExploding && (
          <>
            <ConfettiExplosion
              force={0.8}
              duration={6000}
              particleCount={300}
              zIndex={1000}
              width={1200}
              colors={['#FFB636', '#35F0D0', '#FA48E8', '#5D3A97']}
            />
          </>
        )}
      </div>
      <div className='flex flex-col gap-3 items-center -mt-4'>
        <div className='flex flex-col items-center text-lg font-medium text-center'>
          <span className='text-pt-teal'>{t_modals('success')}</span>
          <span>{!!sharesReceived ? t_modals('gotTokens', { tokens }) : <Spinner />}</span>
        </div>

        <PrizePoolBadge
          chainId={vault.chainId}
          hideBorder={true}
          intl={t_common}
          className='!py-1'
        />
        <SuccessPooly className='w-40 h-auto mt-3' />
      </div>
      <div className='flex flex-col items-center text-sm text-center md:text-base'>
        {t_modals('nowEligible')}

        {!!txHash && (
          <ExternalLink
            href={getBlockExplorerUrl(vault.chainId, txHash, 'tx')}
            size='sm'
            className='text-pt-purple-200/80 underline'
          >
            {t_common('viewOn', { name })}
          </ExternalLink>
        )}
      </div>

      <ShareButtons vault={vault} />
    </div>
  )
}

interface ShareButtonsProps {
  vault: Vault
}

const ShareButtons = (props: ShareButtonsProps) => {
  const { vault } = props

  const t = useTranslations('TxModals')

  const { data: vaultToken } = useVaultTokenData(vault)

  const network = getNiceNetworkNameByChainId(vault.chainId)
  const hashTags = ['PoolTogether', network]

  const text = useMemo(() => {
    if (!!vaultToken) {
      return {
        twitter: getShareText(vaultToken.symbol, 'twitter'),
        farcaster: getShareText(vaultToken.symbol, 'farcaster'),
        hey: getShareText(vaultToken.symbol, 'hey'),
        base: getShareText(vaultToken.symbol, 'base')
      }
    } else {
      return {}
    }
  }, [vaultToken])

  return (
    <div className='flex flex-col items-center'>
      <h1 className='py-1 text-sm sm:text-md font-medium'>{t('shareOn')}:</h1>
      <div className='flex flex-col gap-2'>
        <SocialShareButton platform='twitter' text={text.twitter} hashTags={hashTags} />
        <ComposeCastButton text={text.base} />
      </div>
    </div>
  )
}

type SharePlatform = 'twitter' | 'farcaster' | 'hey' | 'base'

const getShareText = (tokenSymbol: string, platform: SharePlatform) => {
  const protocolAccounts: Record<SharePlatform, string> = {
    twitter: '@PoolTogether_',
    farcaster: 'PoolTogether',
    hey: '@pooltogether',
    base: 'PoolTogether'
  }

  const pooltogether = protocolAccounts[platform]
  const token = `$${tokenSymbol}`

  const textOptions: string[] = [
    `⚡️ Injecting some excitement into my savings strategy with ${pooltogether}! Just made my deposit - watch out for my victory dance when I scoop up that grand prize. 🏆`,
    `🎉 Just joined the thrill ride of decentralized savings! I've deposited into ${pooltogether}, crossing my fingers for that sweet grand prize win. 🤞🏆💰`,
    `Just added some ${token} to the ${pooltogether} mix! Excited to be part of a no-loss savings game. Who knows, maybe I'll be the next lucky winner! 🤞💸`,
    `🎉 Joined the ${pooltogether} community by depositing ${token} today! Let's see if my luck will land me that grand prize. 🏆🚀`,
    `Tossed my ${token} into the ${pooltogether} mix! Who else is crossing their fingers for a no-loss win?`,
    `Just added some ${token} to the ${pooltogether} party! 🎉 Let's ride this wave together! 🌊💸`,
    `🚂 Deposited ${token} into ${pooltogether} and I'm excited to see where this ride takes me. Could a cool win be in my future? 🎆💰`
  ]

  const pseudoRandomIndex = Math.floor(Math.random() * textOptions.length)

  return textOptions[pseudoRandomIndex]
}

const getSharesReceived = (userAddress: Address, share: Token, txReceipt: TransactionReceipt) => {
  if (txReceipt.status !== 'success') return undefined

  const txLogs = [...txReceipt.logs].reverse()

  for (let i = 0; i < txLogs.length; i++) {
    try {
      const { data, topics, address } = txLogs[i]

      if (lower(share.address) === lower(address)) {
        const { args: eventArgs } = decodeEventLog({
          abi: erc20ABI,
          eventName: 'Transfer',
          data,
          topics
        })

        if (!!eventArgs && lower(eventArgs.to) === lower(userAddress)) {
          return eventArgs.value
        }
      }
    } catch { }
  }
}
