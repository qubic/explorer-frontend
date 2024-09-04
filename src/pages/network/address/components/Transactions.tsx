import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InfiniteScroll } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import { useLazyGetIndentityTransfersQuery } from '@app/store/apis/archiver-v2.api'
import type { TransactionV2 } from '@app/store/apis/archiver-v2.types'
import type { Address } from '@app/store/network/addressSlice'
import { TxItem } from '../../components'

type Props = {
  addressId: string
  address: Address
}

export const BATCH_SIZE = 50

export const TICK_SIZE = 200_000

function Transactions({ addressId, address }: Props) {
  const { t } = useTranslation('network-page')
  const [startTick, setStartTick] = useState(address.endTick - TICK_SIZE)
  const [endTick, setEndTick] = useState(address.endTick)
  const [getIdentityTransfersQuery, { isFetching, error }] = useLazyGetIndentityTransfersQuery({})
  const [displayTransferTxs, setDisplayTransferTxs] = useState<TransactionV2[]>([])
  const [txsList, setTxsList] = useState<TransactionV2[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const hasMore = startTick > 0

  const fetchTransfers = useCallback(
    async (start: number, end: number) => {
      const result = await getIdentityTransfersQuery({
        addressId,
        startTick: start,
        endTick: end
      }).unwrap()

      return result || []
    },
    [getIdentityTransfersQuery, addressId]
  )

  const fetchRecursive = useCallback(
    async (start: number, end: number, accumulatedData: TransactionV2[] = []) => {
      const newTxs = await fetchTransfers(start, end)

      console.log('🚀 ~ fetchRecursive ~ newTxs:', newTxs.length)

      const combinedData = [...new Set(accumulatedData.concat(newTxs))]

      console.log('🚀 ~ fetchRecursive ~ combinedData:', combinedData.length)

      if (combinedData.length < BATCH_SIZE && start > 0) {
        const newEndTick = Math.max(0, start - 1)
        const newStartTick = Math.max(0, start - 1 - TICK_SIZE)
        console.log('ticks in recursive', { newStartTick, newEndTick }, newStartTick - newEndTick)
        return fetchRecursive(newStartTick, newEndTick, combinedData)
      }

      return {
        newTxs: combinedData.sort((a, b) => b.transaction.tickNumber - a.transaction.tickNumber),
        lastStartTick: start,
        lastEndTick: end
      }
    },
    [fetchTransfers]
  )

  const loadMore = useCallback(async () => {
    if (isLoading || isFetching || !hasMore) return

    setIsLoading(true)

    if (txsList.length < BATCH_SIZE) {
      const newStartTick = Math.max(0, startTick - 1 - TICK_SIZE)
      const newEndTick = Math.max(0, startTick - 1)
      console.log('ticks in loadMore', { newStartTick, newEndTick }, newStartTick - newEndTick)
      const { newTxs, lastStartTick, lastEndTick } = await fetchRecursive(newStartTick, newEndTick)

      // since there could be some txs in txsList already, we need to merge them and then slice
      // setTxsList((prev) => [...prev, ...newTxs])
      const updatedTxList = [...txsList, ...newTxs]
      //
      setDisplayTransferTxs((prev) => [...prev, ...updatedTxList.slice(0, BATCH_SIZE)])
      // Removing the txs that we just added to displayTransferTxs
      setTxsList(updatedTxList.slice(BATCH_SIZE, updatedTxList.length))
      // setTxsList((prevTxsList) => prevTxsList.slice(BATCH_SIZE, prevTxsList.length))
      setStartTick(lastStartTick)
      setEndTick(lastEndTick)
    } else {
      setDisplayTransferTxs((prev) => [...prev, ...txsList.slice(0, BATCH_SIZE)])
      setTxsList((prevTxsList) => prevTxsList.slice(BATCH_SIZE, prevTxsList.length))
    }
    setIsLoading(false)
  }, [startTick, fetchRecursive, isLoading, isFetching, hasMore, txsList])

  useEffect(() => {
    let isMounted = true

    const initialFetch = async () => {
      setIsLoading(true)
      const { newTxs, lastStartTick, lastEndTick } = await fetchRecursive(startTick, endTick)

      if (isMounted) {
        setDisplayTransferTxs(newTxs.slice(0, BATCH_SIZE))
        setTxsList(newTxs.slice(BATCH_SIZE, newTxs.length))
        setStartTick(lastStartTick)
        setEndTick(lastEndTick)
        setIsLoading(false)
      }
    }

    if (displayTransferTxs.length === 0 && endTick) {
      initialFetch()
    }

    return () => {
      isMounted = false
    }
  }, [startTick, endTick, fetchRecursive, displayTransferTxs.length])

  console.log('🚀 ~ txsList:', txsList.length)
  console.log('🚀 ~ displayTransferTxs:', displayTransferTxs.length)

  return (
    <InfiniteScroll
      items={displayTransferTxs}
      loadMore={loadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      loader={<DotsLoader showLoadingText />}
      error={error && t('loadingTransactionsError')}
      endMessage={
        <p className="py-32 text-center text-sm text-gray-50">
          {displayTransferTxs.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
        </p>
      }
      renderItem={({ transaction, moneyFlew }: TransactionV2) => (
        <TxItem
          key={transaction.txId}
          tx={transaction}
          identify={addressId}
          variant="primary"
          nonExecutedTxIds={moneyFlew ? [] : [transaction.txId]}
        />
      )}
    />
  )
}

const MemoizedTransactions = memo(Transactions)

export default MemoizedTransactions
