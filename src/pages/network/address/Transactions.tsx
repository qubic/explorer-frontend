import { Alert } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import type { Address, TransactionWithMoneyFlew } from '@app/store/network/addressSlice'
import { getTransferTxs, selectTransferTxs, setLastEndTick } from '@app/store/network/addressSlice'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TxItem } from '../components'

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
  const [endTick, setEndTick] = useState(address?.endTick)
  const [startTick, setStartTick] = useState(address.endTick - TICK_SIZE)

  const fetchMoreTxs = useCallback(() => {
    if (!isLoading && hasMore && endTick) {
      const newEndTick = Math.max(0, lastEndTick - 1 || endTick - TICK_SIZE)
      const newStartTick = Math.max(0, lastStartTick - 1 || newEndTick - TICK_SIZE)
      if (newEndTick < endTick) {
        dispatch(getTransferTxs({ addressId, startTick: newStartTick, endTick: newEndTick }))
        setEndTick(newEndTick)
        setStartTick(newStartTick)
      }
    }
  }, [isLoading, hasMore, endTick, lastEndTick, lastStartTick, dispatch, addressId])

  const loadMore = useCallback(() => {
    const remainingTxs = transferTxs.slice(
      displayTransferTxs.length,
      displayTransferTxs.length + BATCH_SIZE
    )
    if (remainingTxs.length >= BATCH_SIZE) {
      setDisplayTransferTxs((prev) => [...prev, ...remainingTxs])
    } else if (hasMore && !isLoading) {
      fetchMoreTxs()
    }
  }, [transferTxs, displayTransferTxs.length, hasMore, isLoading, fetchMoreTxs])

  const renderTxItem = useCallback(
    (tx: TransactionWithMoneyFlew) => (
      <TxItem
        key={tx.txId}
        tx={tx}
        identify={addressId}
        variant="primary"
        nonExecutedTxIds={tx?.moneyFlew ? [] : [tx?.txId]}
      />
    ),
    [addressId]
  )

  useEffect(() => {
    dispatch(setLastEndTick(endTick))
  }, [endTick, dispatch])

  useEffect(() => {
    if (!transferTxs.length && endTick) {
      dispatch(getTransferTxs({ addressId, startTick, endTick }))
    }
  }, [addressId, startTick, endTick, dispatch, transferTxs.length])

  useEffect(() => {
    if (transferTxs.length > 0) {
      setDisplayTransferTxs((prev) => [
        ...prev,
        ...transferTxs.slice(prev.length, prev.length + BATCH_SIZE)
      ])
    }
  }, [transferTxs])

  return (
    <div className="grid w-full gap-10">
      <div className="flex flex-col gap-12">
        {displayTransferTxs.map((item) => renderTxItem(item))}
      </div>
      {(() => {
        if (isLoading) return <DotsLoader className="sm:text-16" />
        if (error) return <Alert variant="error">{error}</Alert>
        if (hasMore)
          return (
            <button
              type="button"
              onClick={loadMore}
              style={{ justifySelf: 'center', marginBlock: 5, paddingInline: 2.5 }}
            >
              {t('loadMore')}
            </button>
          )
        return (
          <p className="py-32 text-center text-14 text-gray-50">
            {displayTransferTxs.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        )
      })()}
    </div>
  )
}
