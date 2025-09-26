import { useLazyGetAddressHistoryQuery } from '@app/store/apis/qli'
import type { TransactionWithType } from '@app/types'
import { useCallback, useEffect, useState } from 'react'

const PAGE_SIZE = 50

export interface UseHistoricalTransactionsOutput {
  historicalTransactions: TransactionWithType[]
  loadMoreTransactions: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function useHistoricalTransactions(
  addressId: string,
  options: { skip: boolean } = { skip: false }
): UseHistoricalTransactionsOutput {
  const [triggerGetHistory, { isFetching, error }] = useLazyGetAddressHistoryQuery()

  const [historicalTxs, setHistoricalTxs] = useState<TransactionWithType[]>([])
  const [page, setPage] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const loadMoreTransactions = useCallback(async () => {
    if (!hasMore || isFetching || error) return

    try {
      const result = await triggerGetHistory({ addressId, page, pageSize: PAGE_SIZE }).unwrap()

      if (result?.length) {
        setHistoricalTxs((prev) => {
          // Create a set of existing transaction IDs for deduplication
          const existingTxIds = new Set(prev.map(({ transaction }) => transaction.txId))

          // Filter out transactions that already exist
          const newUniqueTxs = result.filter(({ transaction }) => {
            return !existingTxIds.has(transaction.txId)
          })

          // Return the combined array
          return [...prev, ...newUniqueTxs]
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
    if (historicalTxs.length === 0 && !options.skip) {
      loadMoreTransactions()
    }
  }, [historicalTxs.length, loadMoreTransactions, options.skip])

  return {
    historicalTransactions: historicalTxs,
    loadMoreTransactions,
    hasMore,
    isLoading: isFetching,
    error: error ? (error as string) : null
  }
}
