import { useCallback, useEffect, useRef, useState } from 'react'

import type { GetAddressBalancesResponse } from '@app/store/apis/archiver-v1'
import type { Transaction } from '@app/store/apis/archiver-v2'
import { useLazyGetIndentityTransfersQuery } from '@app/store/apis/archiver-v2'

const PAGE_SIZE = 50
const START_TICK = 1
const END_TICK = 999_999_999 // Endpoint has now pagination but we still have to provide an end tick, we set it to a very large number

export interface UseLatestTransactionsResult {
  transactions: Transaction[]
  loadMoreTransactions: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function useLatestTransactions(
  addressId: string,
  addressEndTick: GetAddressBalancesResponse['balance']['validForTick']
): UseLatestTransactionsResult {
  const [txsList, setTxsList] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [nextPage, setNextPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const cancellationRef = useRef(false)

  const [getIdentityTransfersQuery, { isFetching, error }] = useLazyGetIndentityTransfersQuery()

  const fetchTransfers = useCallback(async () => {
    const result = await getIdentityTransfersQuery({
      addressId,
      startTick: START_TICK,
      endTick: END_TICK,
      page: nextPage,
      pageSize: PAGE_SIZE
    }).unwrap()

    return result
  }, [getIdentityTransfersQuery, addressId, nextPage])

  const loadMoreTransactions = useCallback(async () => {
    if (isLoading || isFetching || !hasMore) return

    setIsLoading(true)
    try {
      const { pagination, transactions } = await fetchTransfers()
      setNextPage(pagination.nextPage)
      setTxsList((prev) => [...prev, ...transactions])
      setHasMore(pagination.nextPage !== -1)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, isFetching, hasMore, fetchTransfers])

  useEffect(() => {
    let isMounted = true
    cancellationRef.current = false

    const initialFetch = async () => {
      setIsLoading(true)
      const { pagination, transactions } = await fetchTransfers()

      if (isMounted) {
        setNextPage(pagination.nextPage)
        setTxsList((prev) => [...prev, ...transactions])
        setHasMore(pagination.nextPage !== -1)
        setIsLoading(false)
      }
    }

    if (txsList.length === 0 && hasMore) {
      initialFetch()
    }

    return () => {
      isMounted = false
      cancellationRef.current = true
    }
  }, [addressEndTick, fetchTransfers, hasMore, nextPage, txsList.length])

  useEffect(() => {
    return () => {
      if (addressId) {
        setTxsList([])
        setHasMore(true)
        setNextPage(1)
      }
    }
  }, [addressId])

  return {
    transactions: txsList,
    loadMoreTransactions,
    hasMore,
    isLoading,
    error: error ? String(error) : null
  }
}
