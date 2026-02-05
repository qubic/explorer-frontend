import { useGetTransactionsForIdentityMutation } from '@app/store/apis/query-service/query-service.api'
import type {
  QueryServiceResponse,
  QueryServiceTransaction
} from '@app/store/apis/query-service/query-service.types'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TransactionFilters } from '../components/TransactionsOverview/filterUtils'
import { extractErrorMessage } from '../components/TransactionsOverview/filterUtils'

// Re-export types from filterUtils for backward compatibility
export type {
  AddressFilter,
  AddressFilterMode,
  TransactionDirection,
  TransactionFilters
} from '../components/TransactionsOverview/filterUtils'

const PAGE_SIZE = 50
export const MAX_TRANSACTION_RESULTS = 10_000 // query service limit

// Helper function to calculate start date from preset days
// This is called at request time so the date is always fresh
// Returns full datetime format (YYYY-MM-DDTHH:mm:ss) to preserve time precision for presets like "Last hour"
const getStartDateFromPresetDays = (days: number): string => {
  const now = new Date()
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const year = start.getFullYear()
  const month = String(start.getMonth() + 1).padStart(2, '0')
  const day = String(start.getDate()).padStart(2, '0')
  const hours = String(start.getHours()).padStart(2, '0')
  const minutes = String(start.getMinutes()).padStart(2, '0')
  const seconds = String(start.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export interface UseLatestTransactionsResult {
  transactions: QueryServiceTransaction[]
  totalCount: number | null
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
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<TransactionFilters>({})
  const cancellationRef = useRef(false)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [hasError, setHasError] = useState(false)

  const [getTransactionsForIdentity, { error }] = useGetTransactionsForIdentityMutation()

  const hasMore = !reachedEnd && !hasError && offset < MAX_TRANSACTION_RESULTS

  const fetchPage = useCallback(
    async (currentOffset: number, filters: TransactionFilters = {}) => {
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

      // Handle multi-address source filter
      if (filters.sourceFilter?.addresses && filters.sourceFilter.addresses.length > 0) {
        const validAddresses = filters.sourceFilter.addresses.filter((addr) => addr.trim() !== '')
        if (validAddresses.length > 0) {
          const commaSeparated = validAddresses.join(',')
          if (filters.sourceFilter.mode === 'exclude') {
            cleanFilters['source-exclude'] = commaSeparated
          } else {
            cleanFilters.source = commaSeparated
          }
        }
      }

      // Handle multi-address destination filter
      if (filters.destinationFilter?.addresses && filters.destinationFilter.addresses.length > 0) {
        const validAddresses = filters.destinationFilter.addresses.filter(
          (addr) => addr.trim() !== ''
        )
        if (validAddresses.length > 0) {
          const commaSeparated = validAddresses.join(',')
          if (filters.destinationFilter.mode === 'exclude') {
            cleanFilters['destination-exclude'] = commaSeparated
          } else {
            cleanFilters.destination = commaSeparated
          }
        }
      }

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

      // Handle amount range - if start equals end, use exact match
      if (
        filters.amountRange?.start &&
        filters.amountRange?.end &&
        filters.amountRange.start.trim() === filters.amountRange.end.trim()
      ) {
        cleanFilters.amount = filters.amountRange.start.trim()
      }

      // Handle inputType range - if start equals end, use exact match
      if (
        filters.inputTypeRange?.start &&
        filters.inputTypeRange?.end &&
        filters.inputTypeRange.start.trim() === filters.inputTypeRange.end.trim()
      ) {
        cleanFilters.inputType = filters.inputTypeRange.start.trim()
      }

      // Handle tickNumber range - if start equals end, use exact match
      if (
        filters.tickNumberRange?.start &&
        filters.tickNumberRange?.end &&
        filters.tickNumberRange.start.trim() === filters.tickNumberRange.end.trim()
      ) {
        cleanFilters.tickNumber = filters.tickNumberRange.start.trim()
      }

      // Check if amount range should be used (has values and is not an exact match)
      const hasAmountRange = filters.amountRange?.start || filters.amountRange?.end
      const isExactAmountMatch =
        filters.amountRange?.start &&
        filters.amountRange?.end &&
        filters.amountRange.start.trim() === filters.amountRange.end.trim()
      const shouldUseAmountRange = hasAmountRange && !isExactAmountMatch

      // Check if inputType range should be used (has values and is not an exact match)
      const hasInputTypeRange = filters.inputTypeRange?.start || filters.inputTypeRange?.end
      const isExactInputTypeMatch =
        filters.inputTypeRange?.start &&
        filters.inputTypeRange?.end &&
        filters.inputTypeRange.start.trim() === filters.inputTypeRange.end.trim()
      const shouldUseInputTypeRange = hasInputTypeRange && !isExactInputTypeMatch

      // Check if tickNumber range should be used (has values and is not an exact match)
      const hasTickNumberRange = filters.tickNumberRange?.start || filters.tickNumberRange?.end
      const isExactTickNumberMatch =
        filters.tickNumberRange?.start &&
        filters.tickNumberRange?.end &&
        filters.tickNumberRange.start.trim() === filters.tickNumberRange.end.trim()
      const shouldUseTickNumberRange = hasTickNumberRange && !isExactTickNumberMatch

      const ranges = {
        // Handle inputType range (when not exact match)
        ...(shouldUseInputTypeRange && {
          inputType: {
            ...(filters.inputTypeRange?.start && filters.inputTypeRange.start.trim() !== ''
              ? { gte: filters.inputTypeRange.start.trim() }
              : {}),
            ...(filters.inputTypeRange?.end && filters.inputTypeRange.end.trim() !== ''
              ? { lte: filters.inputTypeRange.end.trim() }
              : {})
          }
        }),
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
        // Handle tickNumber range (when not exact match)
        ...(shouldUseTickNumberRange && {
          tickNumber: {
            ...(filters.tickNumberRange?.start && filters.tickNumberRange.start.trim() !== ''
              ? { gte: filters.tickNumberRange.start.trim() }
              : {}),
            ...(filters.tickNumberRange?.end && filters.tickNumberRange.end.trim() !== ''
              ? { lte: filters.tickNumberRange.end.trim() }
              : {})
          }
        }),
        // Handle date range - recalculate from presetDays if set (so "Last 24 hours" is always fresh)
        ...(() => {
          // If presetDays is set, calculate the start date now (at request time)
          const startDate =
            filters.dateRange?.presetDays !== undefined
              ? getStartDateFromPresetDays(filters.dateRange.presetDays)
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
          offset: currentOffset,
          size: PAGE_SIZE
        }
      }).unwrap()

      return {
        transactions: result?.transactions ?? [],
        total: result?.hits?.total ?? null
      }
    },
    [getTransactionsForIdentity, addressId]
  )

  const loadMoreTransactions = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    try {
      const { transactions: newTxs } = await fetchPage(offset, activeFilters)
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
    setTotalCount(null)
    setOffset(0)
    setReachedEnd(false)
    setHasError(false)

    const initialFetch = async () => {
      setIsLoading(true)
      try {
        const { transactions: firstPage, total } = await fetchPage(0, activeFilters)
        if (!cancellationRef.current) {
          setTransactions(firstPage)
          setTotalCount(total)
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
    totalCount,
    loadMoreTransactions,
    hasMore,
    isLoading,
    error: extractErrorMessage(error),
    applyFilters,
    clearFilters,
    activeFilters
  }
}
