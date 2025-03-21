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
          const txIdSet = new Set(prev.map(({ transaction }) => transaction.txId))
          const uniqueTxs = result.filter(({ transaction }) => !txIdSet.has(transaction.txId))
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
