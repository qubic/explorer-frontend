import { useCallback, useEffect, useState } from 'react'

import { EVENT_TYPES, type TransactionEvent, useGetEventsQuery } from '@app/store/apis/events'

const PAGE_SIZE = 25
const MAX_TOTAL = 10_000

const BURN_LOG_TYPES = [EVENT_TYPES.BURNING, EVENT_TYPES.DUST_BURNING]
const DEDUCTION_LOG_TYPES = [EVENT_TYPES.CONTRACT_RESERVE_DEDUCTION]

interface InfiniteEventResult {
  events: TransactionEvent[]
  total: number
  hasMore: boolean
  isLoading: boolean
  hasError: boolean
  loadMore: () => void
}

function useInfiniteEvents(contractIndex: number, logTypes: number[]): InfiniteEventResult {
  const [page, setPage] = useState(0)
  const [accumulated, setAccumulated] = useState<TransactionEvent[]>([])

  // Reset state when contractIndex changes
  useEffect(() => {
    setPage(0)
    setAccumulated([])
  }, [contractIndex])

  const offset = page * PAGE_SIZE

  const { data, isFetching, isError } = useGetEventsQuery({
    contractIndex,
    logType: logTypes,
    offset,
    size: PAGE_SIZE
  })

  const total = data?.total ?? 0

  // Accumulate events only when data changes (not page)
  useEffect(() => {
    if (!data?.events) return
    setAccumulated((prev) => {
      if (offset === 0) return data.events
      const existingIds = new Set(prev.map((e) => e.logId))
      const newEvents = data.events.filter((e) => !existingIds.has(e.logId))
      return [...prev, ...newEvents]
    })
  }, [data?.events, offset])

  // Use page size sentinel to detect end of results
  const hasMore =
    !!data?.events && data.events.length >= PAGE_SIZE && accumulated.length < MAX_TOTAL

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1)
    }
  }, [isFetching, hasMore])

  return {
    events: accumulated,
    total,
    hasMore,
    isLoading: isFetching,
    hasError: isError && accumulated.length === 0,
    loadMore
  }
}

export default function useContractReserveEvents(contractIndex: number) {
  const burns = useInfiniteEvents(contractIndex, BURN_LOG_TYPES)
  const deductions = useInfiniteEvents(contractIndex, DEDUCTION_LOG_TYPES)

  return { burns, deductions }
}
