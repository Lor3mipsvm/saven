import { Intl } from '@shared/types'
import { Button, ButtonProps, Spinner } from '@shared/ui'
import { getNiceNetworkNameByChainId } from '@shared/utilities'
import classNames from 'classnames'
import { useEffect } from 'react'
import { Address } from 'viem'
import { useAccount, useConnect } from 'wagmi'

export interface TransactionButtonProps extends Omit<ButtonProps, 'onClick'> {
  chainId: number
  isTxLoading: boolean
  isTxSuccess: boolean
  write?: () => void
  txHash?: string
  txDescription?: string
  addRecentTransaction?: (tx: { hash: string; description: string; confirmations?: number }) => void
  intl?: { common?: Intl<'connectWallet'> }
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
    ...rest
  } = props

  // const { setUserAddress, isDisconnected } = useAccount()

  const {
    isDisconnected,
    address: accountAddress,
    status,
    connector: accountConnector
  } = useAccount()
  const { connectors, connect, status: connectStatus } = useConnect()

  // Wallet connect status
  const connector = accountConnector || connectors[0]
  const isLoading = connectStatus === 'pending' || status === 'connecting'

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
          connect(
            { connector },
            {
              onSuccess: () => {
                // onConnect?.()
                // handleAnalyticsSuccess(accountAddress)
              },
              onError: (_error) => {
                // handleAnalyticsError(error.message, 'ConnectWallet')
              }
            }
          )
        }}
        {...rest}
      >
        <span className={classNames('whitespace-nowrap', innerClassName)}>
          {intl?.common?.('connectWallet') ?? 'Sign In'}
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
