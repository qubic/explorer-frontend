import { useGetTransactionsForIdentityMutation } from '@app/store/apis/query-service/query-service.api'
import type {
  QueryServiceResponse,
  QueryServiceTransaction
} from '@app/store/apis/query-service/query-service.types'
import { useCallback, useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 50
const MAX_RESULTS = 10_000 // query service limit

export interface TransactionFilters {
  source?: string
  destination?: string
  amount?: string
  amountRange?: {
    start?: string
    end?: string
  }
  inputType?: string
  tickNumberRange?: {
    start?: string
    end?: string
  }
  dateRange?: {
    start?: string
    end?: string
  }
}

export interface UseLatestTransactionsResult {
  transactions: QueryServiceTransaction[]
  loadMoreTransactions: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
  applyFilters: (filters: TransactionFilters) => void
  clearFilters: () => void
  activeFilters: TransactionFilters
}

export default function useLatestTransactions(addressId: string): UseLatestTransactionsResult {
  const [transactions, setTransactions] = useState<QueryServiceTransaction[]>([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<TransactionFilters>({})
  const cancellationRef = useRef(false)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [hasError, setHasError] = useState(false)

  const [getTransactionsForIdentity, { error }] = useGetTransactionsForIdentityMutation()

  const hasMore = !reachedEnd && !hasError && offset < MAX_RESULTS

  const fetchPage = useCallback(
    async (currentOffset: number, filters: TransactionFilters = {}) => {
      // Clean up filters - remove empty strings and undefined values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (key === 'tickNumberRange' || key === 'amountRange') {
          return acc
        }
        if (typeof value === 'string' && value.trim() !== '') {
          return { ...acc, [key]: value.trim() }
        }
        return acc
      }, {} as TransactionFilters)

      // Handle amount range - if start equals end, use exact match
      if (
        filters.amountRange?.start &&
        filters.amountRange?.end &&
        filters.amountRange.start.trim() === filters.amountRange.end.trim()
      ) {
        cleanFilters.amount = filters.amountRange.start.trim()
      }

      // Check if amount range should be used (has values and is not an exact match)
      const hasAmountRange = filters.amountRange?.start || filters.amountRange?.end
      const isExactAmountMatch =
        filters.amountRange?.start &&
        filters.amountRange?.end &&
        filters.amountRange.start.trim() === filters.amountRange.end.trim()
      const shouldUseAmountRange = hasAmountRange && !isExactAmountMatch

      const ranges = {
        // Handle amount range (when not exact match)
        ...(shouldUseAmountRange && {
          amount: {
            ...(filters.amountRange?.start && filters.amountRange.start.trim() !== ''
              ? { gte: filters.amountRange.start.trim() }
              : {}),
            ...(filters.amountRange?.end && filters.amountRange.end.trim() !== ''
              ? { lte: filters.amountRange.end.trim() }
              : {})
          }
        }),
        ...(filters.tickNumberRange?.start || filters.tickNumberRange?.end
          ? {
              tickNumber: {
                ...(filters.tickNumberRange.start && filters.tickNumberRange.start.trim() !== ''
                  ? { gte: filters.tickNumberRange.start.trim() }
                  : {}),
                ...(filters.tickNumberRange.end && filters.tickNumberRange.end.trim() !== ''
                  ? { lte: filters.tickNumberRange.end.trim() }
                  : {})
              }
            }
          : {}),
        ...(filters.dateRange?.start || filters.dateRange?.end
          ? {
              timestamp: {
                ...(filters.dateRange.start
                  ? { gte: new Date(filters.dateRange.start).getTime().toString() }
                  : {}),
                ...(filters.dateRange.end
                  ? { lte: new Date(filters.dateRange.end).getTime().toString() }
                  : {})
              }
            }
          : {})
      }

      const result: QueryServiceResponse = await getTransactionsForIdentity({
        identity: addressId,
        filters: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
        ranges,
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
      const newTxs = await fetchPage(offset, activeFilters)
      if (!cancellationRef.current) {
        if (newTxs.length > 0) {
          setTransactions((prev) => [...prev, ...newTxs])
          setOffset((prev) => prev + PAGE_SIZE)
        }
        if (newTxs.length < PAGE_SIZE) {
          setReachedEnd(true)
        }
        setHasError(false)
      }
    } catch (err) {
      if (!cancellationRef.current) {
        setHasError(true)
      }
      throw err
    } finally {
      if (!cancellationRef.current) {
        setIsLoading(false)
      }
    }
  }, [isLoading, hasMore, offset, fetchPage, activeFilters])

  const applyFilters = useCallback((filters: TransactionFilters) => {
    setActiveFilters(filters)
    setTransactions([])
    setOffset(0)
    setReachedEnd(false)
    setHasError(false)
  }, [])

  const clearFilters = useCallback(() => {
    setActiveFilters({})
    setTransactions([])
    setOffset(0)
    setReachedEnd(false)
    setHasError(false)
  }, [])

  useEffect(() => {
    cancellationRef.current = false
    setTransactions([])
    setOffset(0)
    setReachedEnd(false)
    setHasError(false)

    const initialFetch = async () => {
      setIsLoading(true)
      try {
        const firstPage = await fetchPage(0, activeFilters)
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
  }, [addressId, fetchPage, activeFilters])

  return {
    transactions,
    loadMoreTransactions,
    hasMore,
    isLoading,
    error: error ? String(error) : null,
    applyFilters,
    clearFilters,
    activeFilters
  }
}
