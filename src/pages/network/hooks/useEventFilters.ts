import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { EVENT_TYPE_FILTER_OPTIONS, MAX_EVENT_TYPE_SELECTIONS } from '@app/store/apis/events'
import type {
  AddressFilter,
  TransactionDirection
} from '../address/components/TransactionsOverview/filterUtils'
import {
  DIRECTION,
  isOnlyPageAddress,
  validateDateRange,
  validateTickRange
} from '../address/components/TransactionsOverview/filterUtils'
import type { DateRangeValue, EventAmountFilter, TickRangeValue } from '../utils/eventFilterUtils'
import {
  amountFilterToParams,
  applyEventDirectionSync,
  toTickRangeValue
} from '../utils/eventFilterUtils'
import { updateSearchParams, validateAmountRange } from '../utils/filterUtils'

type EventFilterOptions = {
  tickStart?: string
  tickEnd?: string
  eventTypes: number[]
  direction?: TransactionDirection | undefined
  dateRange?: DateRangeValue
  sourceFilter: AddressFilter | undefined
  destinationFilter: AddressFilter | undefined
  amountFilter?: EventAmountFilter
  supportsTick?: boolean
  supportsDate?: boolean
  addressId?: string
}

export type EventFiltersResult = ReturnType<typeof useEventFilters>

export default function useEventFilters({
  tickStart,
  tickEnd,
  eventTypes,
  direction,
  dateRange,
  sourceFilter,
  destinationFilter,
  amountFilter,
  supportsTick = true,
  supportsDate = true,
  addressId
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

  // Local state for amount filter
  const [localAmountFilter, setLocalAmountFilter] = useState<EventAmountFilter | undefined>(
    amountFilter
  )
  const [amountFilterError, setAmountFilterError] = useState<string | null>(null)

  const checkIsPageAddress = useCallback(
    (filter: AddressFilter | undefined): boolean =>
      !!addressId && filter?.mode === 'include' && isOnlyPageAddress(filter, addressId),
    [addressId]
  )

  const isTickActive = supportsTick && (tickStart !== undefined || tickEnd !== undefined)
  const isEventTypeActive = eventTypes.length > 0
  const isDateActive = supportsDate && dateRange !== undefined
  const isSourceActive = sourceFilter !== undefined
  const isDestActive = destinationFilter !== undefined
  const isAmountActive =
    amountFilter !== undefined && (amountFilter.min !== undefined || amountFilter.max !== undefined)
  const hasActiveFilters =
    isTickActive ||
    isEventTypeActive ||
    isDateActive ||
    isSourceActive ||
    isDestActive ||
    isAmountActive

  // --- Tick Range ---

  const handleTickRangeChange = useCallback((value: TickRangeValue | undefined) => {
    setTickRange(value)
    setTickRangeError(null)
  }, [])

  const handleTickRangeApply = useCallback((): boolean => {
    const error = validateTickRange(tickRange?.start, tickRange?.end)
    if (error) {
      setTickRangeError(error)
      return false
    }
    setTickRangeError(null)
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        tickStart: tickRange?.start || undefined,
        tickEnd: tickRange?.end || undefined
      })
    )
    return true
  }, [tickRange, setSearchParams])

  const handleClearTick = useCallback(() => {
    setSearchParams((prev) =>
      updateSearchParams(prev, { tickStart: undefined, tickEnd: undefined })
    )
    setTickRange(undefined)
    setTickRangeError(null)
  }, [setSearchParams])

  // --- Event Type ---

  const handleToggleEventType = useCallback(
    (type: number) => {
      setSearchParams((prev) => {
        const current = prev.get('eventType')
        const types = current
          ? current
              .split(',')
              .filter((s) => s !== '')
              .map(Number)
              .filter(
                (n) =>
                  !Number.isNaN(n) && (EVENT_TYPE_FILTER_OPTIONS as readonly number[]).includes(n)
              )
          : []
        const index = types.indexOf(type)
        let next: number[]
        if (index >= 0) {
          next = types.filter((t) => t !== type)
        } else if (types.length < MAX_EVENT_TYPE_SELECTIONS) {
          next = [...types, type]
        } else {
          return prev
        }
        return updateSearchParams(prev, {
          eventType: next.length > 0 ? next.join(',') : undefined
        })
      })
    },
    [setSearchParams]
  )

  const handleClearEventType = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, { eventType: undefined }))
  }, [setSearchParams])

  // --- Direction ---

  const handleDirectionChange = useCallback(
    (newDirection: TransactionDirection | undefined) => {
      const updates: Record<string, string | undefined> = {
        direction: newDirection
      }
      if (addressId) {
        const { sourceFilter: newSrc, destinationFilter: newDest } = applyEventDirectionSync(
          newDirection,
          addressId,
          sourceFilter,
          destinationFilter
        )
        // Sync URL params
        const srcAddresses = newSrc?.addresses.filter((a) => a.trim() !== '') ?? []
        updates.source = srcAddresses.length > 0 ? srcAddresses.join(',') : undefined
        updates.sourceMode = srcAddresses.length > 0 ? newSrc?.mode : undefined
        const dstAddresses = newDest?.addresses.filter((a) => a.trim() !== '') ?? []
        updates.destination = dstAddresses.length > 0 ? dstAddresses.join(',') : undefined
        updates.destMode = dstAddresses.length > 0 ? newDest?.mode : undefined
        // Sync local state
        setLocalSourceFilter(newSrc)
        setLocalDestFilter(newDest)
      }
      setSearchParams((prev) => updateSearchParams(prev, updates))
    },
    [setSearchParams, addressId, sourceFilter, destinationFilter]
  )

  // --- Date Range ---

  const handleDateRangeChange = useCallback((value: DateRangeValue | undefined) => {
    setLocalDateRange(value)
    setDateRangeError(null)
  }, [])

  const handleDateRangeApply = useCallback((): boolean => {
    const error = validateDateRange(localDateRange?.start, localDateRange?.end)
    if (error) {
      setDateRangeError(error)
      return false
    }
    setDateRangeError(null)
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        dateStart: localDateRange?.start || undefined,
        dateEnd: localDateRange?.end || undefined,
        datePresetDays: undefined
      })
    )
    return true
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
    const updates: Record<string, string | undefined> = {
      source: validAddresses.join(','),
      sourceMode: localSourceFilter?.mode ?? 'include'
    }
    if (checkIsPageAddress(localSourceFilter)) {
      updates.direction = DIRECTION.OUTGOING
    } else if (direction === DIRECTION.OUTGOING) {
      updates.direction = undefined
    }
    setSearchParams((prev) => updateSearchParams(prev, updates))
  }, [localSourceFilter, setSearchParams, checkIsPageAddress, direction])

  const handleClearSource = useCallback(() => {
    const updates: Record<string, string | undefined> = {
      source: undefined,
      sourceMode: undefined
    }
    // Clear direction if it was auto-synced from source
    if (direction === DIRECTION.OUTGOING) {
      updates.direction = undefined
    }
    setSearchParams((prev) => updateSearchParams(prev, updates))
    setLocalSourceFilter(undefined)
  }, [setSearchParams, direction])

  // --- Destination ---

  const handleDestApply = useCallback(() => {
    const validAddresses = localDestFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []
    if (validAddresses.length === 0) return
    const updates: Record<string, string | undefined> = {
      destination: validAddresses.join(','),
      destMode: localDestFilter?.mode ?? 'include'
    }
    if (checkIsPageAddress(localDestFilter)) {
      updates.direction = DIRECTION.INCOMING
    } else if (direction === DIRECTION.INCOMING) {
      updates.direction = undefined
    }
    setSearchParams((prev) => updateSearchParams(prev, updates))
  }, [localDestFilter, setSearchParams, checkIsPageAddress, direction])

  const handleClearDest = useCallback(() => {
    const updates: Record<string, string | undefined> = {
      destination: undefined,
      destMode: undefined
    }
    // Clear direction if it was auto-synced from destination
    if (direction === DIRECTION.INCOMING) {
      updates.direction = undefined
    }
    setSearchParams((prev) => updateSearchParams(prev, updates))
    setLocalDestFilter(undefined)
  }, [setSearchParams, direction])

  // --- Amount ---

  const handleAmountChange = useCallback((value: EventAmountFilter | undefined) => {
    setLocalAmountFilter(value)
    setAmountFilterError(null)
  }, [])

  const handleAmountApply = useCallback((): boolean => {
    const error = validateAmountRange(localAmountFilter?.min, localAmountFilter?.max)
    if (error) {
      setAmountFilterError(error)
      return false
    }
    setAmountFilterError(null)
    setSearchParams((prev) => updateSearchParams(prev, amountFilterToParams(localAmountFilter)))
    return true
  }, [localAmountFilter, setSearchParams])

  const handleClearAmount = useCallback(() => {
    setSearchParams((prev) =>
      updateSearchParams(prev, {
        amountMin: undefined,
        amountMax: undefined,
        amountAsset: undefined
      })
    )
    setLocalAmountFilter(undefined)
    setAmountFilterError(null)
  }, [setSearchParams])

  // --- Clear All ---

  const handleClearAll = useCallback(() => {
    const updates: Record<string, undefined> = {
      eventType: undefined,
      direction: undefined,
      source: undefined,
      sourceMode: undefined,
      destination: undefined,
      destMode: undefined,
      amountMin: undefined,
      amountMax: undefined,
      amountAsset: undefined
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
    setLocalAmountFilter(undefined)
    setAmountFilterError(null)
  }, [setSearchParams, supportsTick, supportsDate])

  // --- Mobile ---

  const handleMobileApplyFilters = useCallback(
    (filters: {
      tickRange?: TickRangeValue
      eventTypes?: number[]
      dateRange?: DateRangeValue
      sourceFilter?: AddressFilter
      destinationFilter?: AddressFilter
      direction?: TransactionDirection
      amountFilter?: EventAmountFilter
    }) => {
      const srcAddresses =
        filters.sourceFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []
      const dstAddresses =
        filters.destinationFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []

      // Validate tick range — skip invalid values
      const tickValid = !validateTickRange(filters.tickRange?.start, filters.tickRange?.end)
      const validTickStart = tickValid ? filters.tickRange?.start || undefined : undefined
      const validTickEnd = tickValid ? filters.tickRange?.end || undefined : undefined

      // Validate date range — skip invalid values, presets bypass validation
      const dateIsPreset = filters.dateRange?.presetDays !== undefined
      const dateValid =
        dateIsPreset || !validateDateRange(filters.dateRange?.start, filters.dateRange?.end)

      const updates: Record<string, string | undefined> = {
        eventType:
          filters.eventTypes && filters.eventTypes.length > 0
            ? filters.eventTypes.join(',')
            : undefined,
        direction: filters.direction,
        source: srcAddresses.length > 0 ? srcAddresses.join(',') : undefined,
        sourceMode: srcAddresses.length > 0 ? filters.sourceFilter?.mode ?? 'include' : undefined,
        destination: dstAddresses.length > 0 ? dstAddresses.join(',') : undefined,
        destMode:
          dstAddresses.length > 0 ? filters.destinationFilter?.mode ?? 'include' : undefined,
        ...amountFilterToParams(filters.amountFilter)
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
      setLocalAmountFilter(filters.amountFilter)
      setAmountFilterError(null)
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
    handleToggleEventType,
    handleClearEventType,
    handleDirectionChange,
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
    localAmountFilter,
    amountFilterError,
    isAmountActive,
    handleAmountChange,
    handleAmountApply,
    handleClearAmount,
    handleClearAll,
    handleMobileApplyFilters
  }
}
