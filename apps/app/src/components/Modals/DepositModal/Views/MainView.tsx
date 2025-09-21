import { PrizePool, Vault } from '@generationsoftware/hyperstructure-client-js'
import {
  useVaultExchangeRate,
  useVaultShareData,
  useVaultTokenAddress
} from '@generationsoftware/hyperstructure-react-hooks'
import { PrizePoolBadge } from '@shared/react-components'
import { Skeleton, Spinner } from '@shared/ui'
import { getNiceNetworkNameByChainId, lower } from '@shared/utilities'
import { useAtomValue } from 'jotai'
import { useTranslations } from 'next-intl'
import { Odds } from '../../Odds'
import {
  DepositForm,
  depositFormShareAmountAtom,
  depositFormTokenAddressAtom
} from '../DepositForm'

interface MainViewProps {
  vault: Vault
  prizePool: PrizePool
  selectedCabanaVault?: any
}

export const MainView = (props: MainViewProps) => {
  const { vault, prizePool, selectedCabanaVault } = props

  const t_common = useTranslations('Common')
  const t_txModals = useTranslations('TxModals')

  const { data: share } = useVaultShareData(vault)
  const { data: vaultTokenAddress } = useVaultTokenAddress(vault)

  const formTokenAddress = useAtomValue(depositFormTokenAddressAtom)
  const formShareAmount = useAtomValue(depositFormShareAmountAtom)

  const { data: vaultExchangeRate } = useVaultExchangeRate(vault)

  const vaultName = vault.name ?? share?.name
  const networkName = getNiceNetworkNameByChainId(vault.chainId)

  const isZapping =
    !!vaultTokenAddress &&
    !!formTokenAddress &&
    lower(vaultTokenAddress) !== lower(formTokenAddress)

  return (
    <div className='flex flex-col gap-6'>
      <span className='text-xl font-bold text-center text-white'>
        Deposit to Vault
      </span>
      <div className='flex flex-wrap gap-2 justify-center'>
        <span className='px-3 py-1 text-sm bg-amber-500/10 text-amber-200 rounded-full border border-amber-500/30 font-medium'>
          {selectedCabanaVault?.underlyingAssetSymbol || selectedCabanaVault?.vaultName?.replace('Prize ', '') || vault.name?.replace('Prize ', '') || vault.symbol || 'Unknown Asset'}
        </span>
        <span className='px-3 py-1 text-sm bg-slate-700/50 text-slate-200 rounded-full border border-slate-600/50 font-medium'>
          {selectedCabanaVault?.yieldSource || 'Unknown Protocol'}
        </span>
      </div>
      {/* TODO: add flow for when exchange rate cannot be found */}
      {!!vaultExchangeRate && (
        <>
          <DepositForm vault={vault} showInputInfoRows={true} />
          {!!formShareAmount ? (
            <div className='flex flex-col gap-4 mx-auto md:flex-row md:gap-9'>
              <Odds vault={vault} prizePool={prizePool} />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
