import { useGetTransactionsForIdentityMutation } from '@app/store/apis/query-service/query-service.api'
import type {
  QueryServiceResponse,
  QueryServiceTransaction
} from '@app/store/apis/query-service/query-service.types'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TransactionFilters } from '../components/TransactionsOverview/filterUtils'
import {
  buildDestinationFilter,
  buildSourceFilter,
  extractErrorMessage,
  getStartDateFromDays
} from '../components/TransactionsOverview/filterUtils'
import { buildRangeFilter } from '../../utils/filterUtils'

// Re-export types from filterUtils for backward compatibility
export type {
  AddressFilter,
  AddressFilterMode,
  TransactionDirection,
  TransactionFilters
} from '../components/TransactionsOverview/filterUtils'

export const MAX_TRANSACTION_RESULTS = 10_000 // query service limit

export interface UseLatestTransactionsResult {
  transactions: QueryServiceTransaction[]
  totalCount: number | null
  isLoading: boolean
  error: string | null
  applyFilters: (filters: TransactionFilters) => void
  clearFilters: () => void
  activeFilters: TransactionFilters
}

export default function useLatestTransactions(
  addressId: string,
  page: number,
  pageSize: number
): UseLatestTransactionsResult {
  const [transactions, setTransactions] = useState<QueryServiceTransaction[]>([])
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<TransactionFilters>({})
  const cancellationRef = useRef(false)

  const [getTransactionsForIdentity, { error }] = useGetTransactionsForIdentityMutation()

  const fetchPage = useCallback(
    async (offset: number, size: number, filters: TransactionFilters = {}) => {
      // Clean up filters - remove empty strings and undefined values
      // Skip special handling fields: direction, ranges, and multi-address filters
      const cleanFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (
            key === 'direction' ||
            key === 'tickNumberRange' ||
            key === 'amountRange' ||
            key === 'dateRange' ||
            key === 'inputTypeRange' ||
            key === 'sourceFilter' ||
            key === 'destinationFilter'
          ) {
            return acc
          }
          if (typeof value === 'string' && value.trim() !== '') {
            return { ...acc, [key]: value.trim() }
          }
          return acc
        },
        {} as Record<string, string>
      )

      // Handle multi-address source/destination filters
      Object.assign(cleanFilters, buildSourceFilter(filters.sourceFilter))
      Object.assign(cleanFilters, buildDestinationFilter(filters.destinationFilter))

      // Handle direction filter - set source or destination based on direction
      // Only apply if the corresponding multi-address filter is not already set
      if (filters.direction === 'incoming') {
        if (!cleanFilters.destination && !cleanFilters['destination-exclude']) {
          cleanFilters.destination = addressId
        }
      } else if (filters.direction === 'outgoing') {
        if (!cleanFilters.source && !cleanFilters['source-exclude']) {
          cleanFilters.source = addressId
        }
      }

      // Build ranges for amount, inputType, and tickNumber using shared utility
      const amountResult = buildRangeFilter(filters.amountRange?.start, filters.amountRange?.end)
      const inputTypeResult = buildRangeFilter(
        filters.inputTypeRange?.start,
        filters.inputTypeRange?.end
      )
      const tickNumberResult = buildRangeFilter(
        filters.tickNumberRange?.start,
        filters.tickNumberRange?.end
      )

      // Set exact match values as filters
      if (amountResult.exactMatch) cleanFilters.amount = amountResult.exactMatch
      if (inputTypeResult.exactMatch) cleanFilters.inputType = inputTypeResult.exactMatch
      if (tickNumberResult.exactMatch) cleanFilters.tickNumber = tickNumberResult.exactMatch

      // Build ranges object
      const ranges = {
        ...(amountResult.range && { amount: amountResult.range }),
        ...(inputTypeResult.range && { inputType: inputTypeResult.range }),
        ...(tickNumberResult.range && { tickNumber: tickNumberResult.range }),
        // Handle date range - recalculate from presetDays if set (so "Last 24 hours" is always fresh)
        ...(() => {
          const startDate =
            filters.dateRange?.presetDays !== undefined
              ? getStartDateFromDays(filters.dateRange.presetDays)
              : filters.dateRange?.start

          if (startDate || filters.dateRange?.end) {
            return {
              timestamp: {
                ...(startDate ? { gte: new Date(startDate).getTime().toString() } : {}),
                ...(filters.dateRange?.end
                  ? { lte: new Date(filters.dateRange.end).getTime().toString() }
                  : {})
              }
            }
          }
          return {}
        })()
      }

      const result: QueryServiceResponse = await getTransactionsForIdentity({
        identity: addressId,
        filters: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
        ranges,
        pagination: {
          offset,
          size
        }
      }).unwrap()

      return {
        transactions: result?.transactions ?? [],
        total: result?.hits?.total ?? null
      }
    },
    [getTransactionsForIdentity, addressId]
  )

  const applyFilters = useCallback((filters: TransactionFilters) => {
    setActiveFilters(filters)
  }, [])

  const clearFilters = useCallback(() => {
    setActiveFilters({})
  }, [])

  // Fetch the requested page whenever page, pageSize, filters, or addressId change
  useEffect(() => {
    cancellationRef.current = false

    const doFetch = async () => {
      setIsLoading(true)
      try {
        const offset = (page - 1) * pageSize
        const { transactions: txs, total } = await fetchPage(offset, pageSize, activeFilters)
        if (!cancellationRef.current) {
          setTransactions(txs)
          setTotalCount(total)
        }
      } finally {
        if (!cancellationRef.current) {
          setIsLoading(false)
        }
      }
    }

    if (addressId) {
      doFetch()
    }

    return () => {
      cancellationRef.current = true
    }
  }, [addressId, page, pageSize, fetchPage, activeFilters])

  return {
    transactions,
    totalCount,
    isLoading,
    error: extractErrorMessage(error),
    applyFilters,
    clearFilters,
    activeFilters
  }
}
