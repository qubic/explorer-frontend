import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { AddressFilter } from '../address/components/TransactionsOverview/filterUtils'
import {
  validateDateRange,
  validateTickRange
} from '../address/components/TransactionsOverview/filterUtils'
import type { DateRangeValue, TickRangeValue } from '../utils/eventFilterUtils'
import { toTickRangeValue } from '../utils/eventFilterUtils'
import { updateSearchParams } from '../utils/filterUtils'

type EventFilterOptions = {
  tickStart?: string
  tickEnd?: string
  eventType: number | undefined
  dateRange?: DateRangeValue
  sourceFilter: AddressFilter | undefined
  destinationFilter: AddressFilter | undefined
  supportsTick?: boolean
  supportsDate?: boolean
}

export type EventFiltersResult = ReturnType<typeof useEventFilters>

export default function useEventFilters({
  tickStart,
  tickEnd,
  eventType,
  dateRange,
  sourceFilter,
  destinationFilter,
  supportsTick = true,
  supportsDate = true
}: EventFilterOptions) {
  const [, setSearchParams] = useSearchParams()

  // Local state for tick range inputs
  const [tickRange, setTickRange] = useState<TickRangeValue | undefined>(
    toTickRangeValue(tickStart, tickEnd)
  )
  const [tickRangeError, setTickRangeError] = useState<string | null>(null)

  // Local state for date range
  const [localDateRange, setLocalDateRange] = useState<DateRangeValue | undefined>(dateRange)
  const [dateRangeError, setDateRangeError] = useState<string | null>(null)

  // Local state for source/destination filters
  const [localSourceFilter, setLocalSourceFilter] = useState<AddressFilter | undefined>(
    sourceFilter
  )
  const [localDestFilter, setLocalDestFilter] = useState<AddressFilter | undefined>(
    destinationFilter
  )

  const isTickActive = supportsTick && (tickStart !== undefined || tickEnd !== undefined)
  const isEventTypeActive = eventType !== undefined
  const isDateActive = supportsDate && dateRange !== undefined
  const isSourceActive = sourceFilter !== undefined
  const isDestActive = destinationFilter !== undefined
  const hasActiveFilters =
    isTickActive || isEventTypeActive || isDateActive || isSourceActive || isDestActive

  // --- Tick Range ---

  const handleTickRangeChange = useCallback((value: TickRangeValue | undefined) => {
    setTickRange(value)
    setTickRangeError(null)
  }, [])

  const handleTickRangeApply = useCallback(() => {
    const error = validateTickRange(tickRange?.start, tickRange?.end)
    if (error) {
      setTickRangeError(error)
      return
    }
    setTickRangeError(null)
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        tickStart: tickRange?.start || undefined,
        tickEnd: tickRange?.end || undefined
      })
    )
  }, [tickRange, setSearchParams])

  const handleClearTick = useCallback(() => {
    setSearchParams((prev) =>
      updateSearchParams(prev, { tickStart: undefined, tickEnd: undefined })
    )
    setTickRange(undefined)
    setTickRangeError(null)
  }, [setSearchParams])

  // --- Event Type ---

  const handleSelectEventType = useCallback(
    (type: number) => {
      setSearchParams((prev) => updateSearchParams(prev, { eventType: String(type) }))
    },
    [setSearchParams]
  )

  const handleClearEventType = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, { eventType: undefined }))
  }, [setSearchParams])

  // --- Date Range ---

  const handleDateRangeChange = useCallback((value: DateRangeValue | undefined) => {
    setLocalDateRange(value)
    setDateRangeError(null)
  }, [])

  const handleDateRangeApply = useCallback(() => {
    const error = validateDateRange(localDateRange?.start, localDateRange?.end)
    if (error) {
      setDateRangeError(error)
      return
    }
    setDateRangeError(null)
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        dateStart: localDateRange?.start || undefined,
        dateEnd: localDateRange?.end || undefined,
        datePresetDays: undefined
      })
    )
  }, [localDateRange, setSearchParams])

  const handleDatePresetSelect = useCallback(
    (presetDays: number) => {
      setDateRangeError(null)
      setLocalDateRange({ presetDays })
      setSearchParams((prev) =>
        updateSearchParams(prev, {
          dateStart: undefined,
          dateEnd: undefined,
          datePresetDays: String(presetDays)
        })
      )
    },
    [setSearchParams]
  )

  const handleClearDate = useCallback(() => {
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        dateStart: undefined,
        dateEnd: undefined,
        datePresetDays: undefined
      })
    )
    setLocalDateRange(undefined)
    setDateRangeError(null)
  }, [setSearchParams])

  // --- Source ---

  const handleSourceApply = useCallback(() => {
    const validAddresses = localSourceFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []
    if (validAddresses.length === 0) return
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        source: validAddresses.join(','),
        sourceMode: localSourceFilter?.mode ?? 'include'
      })
    )
  }, [localSourceFilter, setSearchParams])

  const handleClearSource = useCallback(() => {
    setSearchParams((prev) =>
      updateSearchParams(prev, { source: undefined, sourceMode: undefined })
    )
    setLocalSourceFilter(undefined)
  }, [setSearchParams])

  // --- Destination ---

  const handleDestApply = useCallback(() => {
    const validAddresses = localDestFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []
    if (validAddresses.length === 0) return
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        destination: validAddresses.join(','),
        destMode: localDestFilter?.mode ?? 'include'
      })
    )
  }, [localDestFilter, setSearchParams])

  const handleClearDest = useCallback(() => {
    setSearchParams((prev) =>
      updateSearchParams(prev, { destination: undefined, destMode: undefined })
    )
    setLocalDestFilter(undefined)
  }, [setSearchParams])

  // --- Clear All ---

  const handleClearAll = useCallback(() => {
    const updates: Record<string, undefined> = {
      eventType: undefined,
      source: undefined,
      sourceMode: undefined,
      destination: undefined,
      destMode: undefined
    }
    if (supportsTick) {
      updates.tickStart = undefined
      updates.tickEnd = undefined
    }
    if (supportsDate) {
      updates.dateStart = undefined
      updates.dateEnd = undefined
      updates.datePresetDays = undefined
    }
    setSearchParams((prev) => updateSearchParams(prev, updates))
    if (supportsTick) {
      setTickRange(undefined)
      setTickRangeError(null)
    }
    if (supportsDate) {
      setLocalDateRange(undefined)
      setDateRangeError(null)
    }
    setLocalSourceFilter(undefined)
    setLocalDestFilter(undefined)
  }, [setSearchParams, supportsTick, supportsDate])

  // --- Mobile ---

  const handleMobileApplyFilters = useCallback(
    (filters: {
      tickRange?: TickRangeValue
      eventType?: number
      dateRange?: DateRangeValue
      sourceFilter?: AddressFilter
      destinationFilter?: AddressFilter
    }) => {
      const srcAddresses =
        filters.sourceFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []
      const dstAddresses =
        filters.destinationFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []

      // Validate tick range — skip invalid values (Fix #1)
      const tickValid = !validateTickRange(filters.tickRange?.start, filters.tickRange?.end)
      const validTickStart = tickValid ? filters.tickRange?.start || undefined : undefined
      const validTickEnd = tickValid ? filters.tickRange?.end || undefined : undefined

      // Validate date range — skip invalid values, presets bypass validation (Fix #1)
      const dateIsPreset = filters.dateRange?.presetDays !== undefined
      const dateValid =
        dateIsPreset || !validateDateRange(filters.dateRange?.start, filters.dateRange?.end)

      const updates: Record<string, string | undefined> = {
        eventType: filters.eventType !== undefined ? String(filters.eventType) : undefined,
        source: srcAddresses.length > 0 ? srcAddresses.join(',') : undefined,
        sourceMode: srcAddresses.length > 0 ? filters.sourceFilter?.mode ?? 'include' : undefined,
        destination: dstAddresses.length > 0 ? dstAddresses.join(',') : undefined,
        destMode: dstAddresses.length > 0 ? filters.destinationFilter?.mode ?? 'include' : undefined
      }

      if (supportsTick) {
        updates.tickStart = validTickStart
        updates.tickEnd = validTickEnd
      }
      if (supportsDate) {
        updates.dateStart =
          dateValid && !dateIsPreset ? filters.dateRange?.start || undefined : undefined
        updates.dateEnd =
          dateValid && !dateIsPreset ? filters.dateRange?.end || undefined : undefined
        updates.datePresetDays =
          dateIsPreset && filters.dateRange?.presetDays !== undefined
            ? String(filters.dateRange.presetDays)
            : undefined
      }

      setSearchParams((prev) => updateSearchParams(prev, updates))

      if (supportsTick) {
        setTickRange(tickValid ? filters.tickRange : undefined)
        setTickRangeError(null)
      }
      if (supportsDate) {
        setLocalDateRange(dateValid ? filters.dateRange : undefined)
        setDateRangeError(null)
      }
      setLocalSourceFilter(filters.sourceFilter)
      setLocalDestFilter(filters.destinationFilter)
    },
    [setSearchParams, supportsTick, supportsDate]
  )

  return {
    tickRange,
    tickRangeError,
    localDateRange,
    dateRangeError,
    localSourceFilter,
    localDestFilter,
    isTickActive,
    isEventTypeActive,
    isDateActive,
    isSourceActive,
    isDestActive,
    hasActiveFilters,
    handleTickRangeChange,
    handleTickRangeApply,
    handleClearTick,
    handleSelectEventType,
    handleClearEventType,
    handleDateRangeChange,
    handleDateRangeApply,
    handleDatePresetSelect,
    handleClearDate,
    setLocalSourceFilter,
    handleSourceApply,
    handleClearSource,
    setLocalDestFilter,
    handleDestApply,
    handleClearDest,
    handleClearAll,
    handleMobileApplyFilters
  }
}
