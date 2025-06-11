import { useAccount } from '@shared/generic-react-hooks'
import { Intl } from '@shared/types'
import { Button, ButtonProps, Spinner } from '@shared/ui'
import { getNiceNetworkNameByChainId } from '@shared/utilities'
import classNames from 'classnames'
import { useEffect } from 'react'
import { Address } from 'viem'

export interface TransactionButtonProps extends Omit<ButtonProps, 'onClick'> {
  chainId: number
  isTxLoading: boolean
  isTxSuccess: boolean
  signInWithWallet: (setUserAddress: (address: Address | undefined) => void) => void
  write?: () => void
  txHash?: string
  txDescription?: string
  addRecentTransaction?: (tx: { hash: string; description: string; confirmations?: number }) => void
  intl?: { base?: Intl<'switchNetwork' | 'switchingNetwork'>; common?: Intl<'signIn'> }
  innerClassName?: string
}

export const TransactionButton = (props: TransactionButtonProps) => {
  const {
    chainId,
    isTxLoading,
    isTxSuccess,
    write,
    txHash,
    txDescription,
    addRecentTransaction,
    intl,
    innerClassName,
    disabled,
    children,
    signInWithWallet,
    ...rest
  } = props

  const { setUserAddress, isDisconnected } = useAccount()

  const networkName = getNiceNetworkNameByChainId(chainId)

  useEffect(() => {
    if (isTxSuccess && !!txHash && !!txDescription && !!addRecentTransaction) {
      addRecentTransaction({
        hash: txHash,
        description: `${networkName}: ${txDescription}`
      })
    }
  }, [isTxSuccess, txHash, txDescription])

  if (isDisconnected) {
    return (
      <Button
        onClick={() => {
          signInWithWallet(setUserAddress)
        }}
        {...rest}
      >
        <span className={classNames('whitespace-nowrap', innerClassName)}>
          {intl?.common?.('signIn') ?? 'Sign In'}
        </span>
      </Button>
    )
  }

  return (
    <Button onClick={write} disabled={!write || isTxLoading || disabled} {...rest}>
      <span
        className={classNames('whitespace-nowrap', innerClassName, {
          'leading-none': isTxLoading
        })}
      >
        {isTxLoading && <Spinner />}
        {!isTxLoading && children}
      </span>
    </Button>
  )
}
