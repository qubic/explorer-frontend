import { useGetTransactionsForIdentityMutation } from '@app/store/apis/query-service/query-service.api'
import type {
  QueryServiceResponse,
  QueryServiceTransaction
} from '@app/store/apis/query-service/query-service.types'
import { useCallback, useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 50
const MAX_RESULTS = 10_000 // query service limit

export interface UseLatestTransactionsResult {
  transactions: QueryServiceTransaction[]
  loadMoreTransactions: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function useLatestTransactions(addressId: string): UseLatestTransactionsResult {
  const [transactions, setTransactions] = useState<QueryServiceTransaction[]>([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const cancellationRef = useRef(false)
  const [reachedEnd, setReachedEnd] = useState(false)

  const [getTransactionsForIdentity, { error }] = useGetTransactionsForIdentityMutation()

  const hasMore = !reachedEnd && offset < MAX_RESULTS

  const fetchPage = useCallback(
    async (currentOffset: number) => {
      const result: QueryServiceResponse = await getTransactionsForIdentity({
        identity: addressId,
        pagination: {
          offset: currentOffset,
          size: PAGE_SIZE
        }
      }).unwrap()

      return result?.transactions ?? []
    },
    [getTransactionsForIdentity, addressId]
  )

  const loadMoreTransactions = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const newTxs = await fetchPage(offset)
      if (!cancellationRef.current) {
        if (newTxs.length > 0) {
          setTransactions((prev) => [...prev, ...newTxs])
          setOffset((prev) => prev + PAGE_SIZE)
        }
        if (newTxs.length < PAGE_SIZE) {
          setReachedEnd(true)
        }
      }
    } finally {
      if (!cancellationRef.current) {
        setIsLoading(false)
      }
    }
  }, [isLoading, hasMore, offset, fetchPage])

  // Initial fetch
  useEffect(() => {
    cancellationRef.current = false
    setTransactions([])
    setOffset(0)
    setReachedEnd(false)

    const initialFetch = async () => {
      setIsLoading(true)
      try {
        const firstPage = await fetchPage(0)
        if (!cancellationRef.current) {
          setTransactions(firstPage)
          setOffset(PAGE_SIZE)
          if (firstPage.length < PAGE_SIZE) {
            setReachedEnd(true)
          }
        }
      } finally {
        if (!cancellationRef.current) {
          setIsLoading(false)
        }
      }
    }

    if (addressId) {
      initialFetch()
    }

    return () => {
      cancellationRef.current = true
    }
  }, [addressId, fetchPage])

  return {
    transactions,
    loadMoreTransactions,
    hasMore,
    isLoading,
    error: error ? String(error) : null
  }
}
