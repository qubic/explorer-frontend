import { useLazyGetAddressHistoryQuery } from '@app/store/apis/qli'
import type { TransactionWithStatus } from '@app/types'
import { useCallback, useEffect, useState } from 'react'

const PAGE_SIZE = 50

export interface UseHistoricalTransactionsOutput {
  historicalTransactions: TransactionWithStatus[]
  loadMoreTransactions: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function useHistoricalTransactions(
  addressId: string
): UseHistoricalTransactionsOutput {
  const [triggerGetHistory, { isFetching, error }] = useLazyGetAddressHistoryQuery()

  const [historicalTxs, setHistoricalTxs] = useState<TransactionWithStatus[]>([])
  const [page, setPage] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const loadMoreTransactions = useCallback(async () => {
    if (!hasMore || isFetching || error) return

    try {
      const result = await triggerGetHistory({ addressId, page, pageSize: PAGE_SIZE }).unwrap()

      if (result?.length) {
        setHistoricalTxs((prev) => {
          const txIdSet = new Set(prev.map((tx) => tx.tx.txId))
          const uniqueTxs = result.filter((tx) => !txIdSet.has(tx.tx.txId))
          return [...prev, ...uniqueTxs]
        })

        setHasMore(result.length === PAGE_SIZE)
        setPage((prevPage) => prevPage + 1)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching transactions:', err)
    }
  }, [addressId, page, triggerGetHistory, hasMore, isFetching, error])

  useEffect(() => {
    if (historicalTxs.length === 0) {
      loadMoreTransactions()
    }
  }, [historicalTxs.length, loadMoreTransactions])

  return {
    historicalTransactions: historicalTxs,
    loadMoreTransactions,
    hasMore,
    isLoading: isFetching,
    error: error ? (error as string) : null
  }
}
