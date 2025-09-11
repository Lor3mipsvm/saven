import { PrizePool, Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useBeefyVault,
  useSelectedVaults,
  useToken,
  useVaultSharePrice,
  useVaultTokenAddress
} from '@generationsoftware/hyperstructure-react-hooks'
import { PrizePoolBadge, TokenIcon } from '@shared/react-components'
import { Token, TokenWithLogo } from '@shared/types'
import { Skeleton } from '@components/ui/skeleton'
import {
  formatBigIntForDisplay,
  formatNumberForDisplay,
  getVaultId,
  lower
} from '@shared/utilities'
import classNames from 'classnames'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Address } from 'viem'
import { Odds } from '../../Odds'
import {
  depositFormShareAmountAtom,
  depositFormTokenAddressAtom,
  depositFormTokenAmountAtom,
  depositZapMinReceivedAtom,
  depositZapPriceImpactAtom
} from '../DepositForm'

interface ReviewViewProps {
  vault: Vault
  prizePool: PrizePool
  selectedCabanaVault?: any
}

export const ReviewView = (props: ReviewViewProps) => {
  const { vault, prizePool, selectedCabanaVault } = props

  const t_common = useTranslations('Common')
  const t_txModals = useTranslations('TxModals')

  return (
    <div className='flex flex-col gap-6'>
      <span className='text-2xl font-bold text-center text-white'>Confirm Deposit</span>
      <div className='flex flex-wrap gap-2 justify-center'>
        <span className='px-3 py-1 text-sm bg-amber-500/10 text-amber-200 rounded-full border border-amber-500/30 font-medium'>
          {selectedCabanaVault?.underlyingAssetSymbol || selectedCabanaVault?.vaultName?.replace('Prize ', '') || vault.name?.replace('Prize ', '') || vault.symbol || 'Unknown Asset'}
        </span>
        <span className='px-3 py-1 text-sm bg-slate-700/50 text-slate-200 rounded-full border border-slate-600/50 font-medium'>
          {selectedCabanaVault?.yieldSource || 'Unknown Protocol'}
        </span>
      </div>
      <BasicDepositForm vault={vault} />
      <div className='flex flex-col gap-4 mx-auto md:flex-row md:gap-9'>
        <Odds vault={vault} prizePool={prizePool} />
      </div>
    </div>
  )
}

interface BasicDepositFormProps {
  vault: Vault
}

const BasicDepositForm = (props: BasicDepositFormProps) => {
  const { vault } = props

  const t_txModals = useTranslations('TxModals')

  const formTokenAddress = useAtomValue(depositFormTokenAddressAtom)
  const formTokenAmount = useAtomValue(depositFormTokenAmountAtom)
  const formShareAmount = useAtomValue(depositFormShareAmountAtom)
  const depositZapPriceImpact = useAtomValue(depositZapPriceImpactAtom)
  const depositZapMinReceived = useAtomValue(depositZapMinReceivedAtom)

  const { data: vaultTokenAddress } = useVaultTokenAddress(vault)

  const tokenAddress = formTokenAddress ?? vaultTokenAddress
  const { data: token } = useToken(vault.chainId, tokenAddress!)

  const { data: share } = useVaultSharePrice(vault)

  const { vaults } = useSelectedVaults()

  const inputVault = useMemo(() => {
    if (!!vault && !!tokenAddress) {
      const vaultId = getVaultId({ chainId: vault.chainId, address: tokenAddress })
      return Object.values(vaults.vaults).find((v) => getVaultId(v) === vaultId)
    }
  }, [vault, tokenAddress, vaults])

  const shareLogoURI = useMemo(() => {
    if (!!vault) {
      return vault.logoURI ?? vaults.allVaultInfo.find((v) => getVaultId(v) === vault.id)?.logoURI
    }
  }, [vault, vaults])

  const { data: beefyVault } = useBeefyVault(vault)

  if (!share || !token) {
    return <></>
  }

  const tokenInfo = {
    ...token,
    amount: formTokenAmount,
    logoURI:
      !!vaultTokenAddress && lower(token.address) === lower(vaultTokenAddress)
        ? vault.tokenLogoURI
        : !!beefyVault && lower(token.address) === lower(beefyVault.address)
          ? beefyVault.logoURI
          : inputVault?.logoURI
  }

  const shareInfo = {
    ...share,
    amount: formShareAmount,
    logoURI: shareLogoURI ?? vault.tokenLogoURI
  }

  return (
    <div className='w-full flex flex-col'>
      <BasicDepositFormInput token={tokenInfo} className='mb-0.5' />
      {!!depositZapMinReceived && (
        <div className='flex flex-col p-2 text-xs text-pt-purple-100'>
          <div className='flex gap-2 items-center'>
            <span className='font-semibold'>{t_txModals('priceImpact')}</span>
            <span className='h-3 grow border-b border-dashed border-pt-purple-50/30' />
            {depositZapPriceImpact !== undefined ? (
              <span>{`${depositZapPriceImpact > 0 ? '+' : ''}${formatNumberForDisplay(
                depositZapPriceImpact,
                { maximumFractionDigits: 2 }
              )}%`}</span>
            ) : (
              <Spinner />
            )}
          </div>
          <div className='flex gap-2 items-center'>
            <span className='font-semibold'>{t_txModals('minimumReceived')}</span>
            <span className='h-3 grow border-b border-dashed border-pt-purple-50/30' />
            <span>
              {formatBigIntForDisplay(depositZapMinReceived, shareInfo.decimals, {
                maximumFractionDigits: 5
              })}{' '}
              {shareInfo.symbol}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface BasicDepositFormInputProps {
  token: Token & Partial<TokenWithLogo> & { amount: string }
  fallbackLogoTokenAddress?: Address
  className?: string
}

// TODO: this should probably include token value like in the main view
const BasicDepositFormInput = (props: BasicDepositFormInputProps) => {
  const { token, fallbackLogoTokenAddress, className } = props

  return (
    <div
      className={classNames(
        'bg-pt-transparent p-3 rounded-lg border border-transparent md:p-4',
        className
      )}
    >
      <div className='flex justify-between gap-6'>
        <span
          title={token.amount}
          className='text-lg font-semibold bg-transparent text-pt-purple-50 whitespace-nowrap overflow-hidden overflow-ellipsis md:text-2xl'
        >
          {token.amount}
        </span>
        <div className='flex shrink-0 items-center gap-1'>
          <TokenIcon
            token={token}
            fallbackToken={{ chainId: token.chainId, address: fallbackLogoTokenAddress }}
          />
          <span className='text-lg font-semibold md:text-2xl'>{token.symbol}</span>
        </div>
      </div>
    </div>
  )
}
