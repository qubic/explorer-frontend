import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, InfiniteScroll } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import type { Address, TransactionWithMoneyFlew } from '@app/store/network/addressSlice'
import { getTransferTxs, selectTransferTxs } from '@app/store/network/addressSlice'
import { TxItem } from '../../components'

type Props = {
  addressId: string
  address: Address
}

export const BATCH_SIZE = 50

export const TICK_SIZE = 100_000

export default function Transactions({ addressId, address }: Props) {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const {
    data: transferTxs,
    isLoading,
    error,
    hasMore,
    lastStartTick,
    lastEndTick
  } = useAppSelector(selectTransferTxs)
  const [displayTransferTxs, setDisplayTransferTxs] = useState<TransactionWithMoneyFlew[]>([])

  const loadMore = useCallback(() => {
    const remainingTxs = transferTxs.slice(
      displayTransferTxs.length,
      displayTransferTxs.length + BATCH_SIZE
    )
    if (remainingTxs.length >= BATCH_SIZE) {
      setDisplayTransferTxs((prev) => [...prev, ...remainingTxs])
    } else if (!isLoading && hasMore) {
      const newEndTick = lastEndTick - 1 - TICK_SIZE
      const newStartTick = lastStartTick - 1 - TICK_SIZE
      dispatch(getTransferTxs({ addressId, startTick: newStartTick, endTick: newEndTick }))
    }
  }, [
    transferTxs,
    displayTransferTxs.length,
    isLoading,
    hasMore,
    lastEndTick,
    lastStartTick,
    dispatch,
    addressId
  ])

  useEffect(() => {
    if (!transferTxs.length && address.endTick) {
      dispatch(
        getTransferTxs({
          addressId,
          startTick: address.endTick - TICK_SIZE,
          endTick: address.endTick
        })
      )
    }
  }, [address.endTick, addressId, dispatch, transferTxs.length])

  useEffect(() => {
    if (transferTxs.length > 0) {
      setDisplayTransferTxs((prev) => [
        ...prev,
        ...transferTxs.slice(prev.length, prev.length + BATCH_SIZE)
      ])
    }
  }, [transferTxs])

  if (error) {
    return <Alert variant="error">{t('errorLoadingTransactions')}</Alert>
  }

  return (
    <InfiniteScroll
      items={displayTransferTxs}
      loadMore={loadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      loader={<DotsLoader showLoadingText />}
      endMessage={
        <p className="py-32 text-center text-14 text-gray-50">
          {displayTransferTxs.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
        </p>
      }
      renderItem={(tx: TransactionWithMoneyFlew) => (
        <TxItem
          key={tx.txId}
          tx={tx}
          identify={addressId}
          variant="primary"
          nonExecutedTxIds={tx.moneyFlew ? [] : [tx.txId]}
        />
      )}
    />
  )
}
