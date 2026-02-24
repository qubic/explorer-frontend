import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { parseNumericInput, updateSearchParams } from '../../utils/filterUtils'

export default function useEventsPageFilters(
  tick: number | undefined,
  eventType: number | undefined
) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [tickInput, setTickInput] = useState(() =>
    parseNumericInput(searchParams.get('tick') ?? '')
  )

  const isTickActive = tick !== undefined
  const isEventTypeActive = eventType !== undefined
  const hasActiveFilters = isTickActive || isEventTypeActive

  const handleTickApply = useCallback(() => {
    const normalized = parseNumericInput(tickInput)
    if (!normalized || parseInt(normalized, 10) <= 0) return
    setSearchParams((prev) => updateSearchParams(prev, { tick: normalized }))
    setTickInput(normalized)
  }, [tickInput, setSearchParams])

  const handleTickKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleTickApply()
    },
    [handleTickApply]
  )

  const handleClearTick = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, { tick: undefined }))
    setTickInput('')
  }, [setSearchParams])

  const handleSelectEventType = useCallback(
    (type: number) => {
      setSearchParams((prev) => updateSearchParams(prev, { eventType: String(type) }))
    },
    [setSearchParams]
  )

  const handleClearEventType = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, { eventType: undefined }))
  }, [setSearchParams])

  const handleClearAll = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, { tick: undefined, eventType: undefined }))
    setTickInput('')
  }, [setSearchParams])

  const handleMobileApplyFilters = useCallback(
    (filters: { tick?: string; eventType?: number }) => {
      setSearchParams((prev) =>
        updateSearchParams(prev, {
          tick: filters.tick || undefined,
          eventType: filters.eventType !== undefined ? String(filters.eventType) : undefined
        })
      )
      setTickInput(filters.tick ?? '')
    },
    [setSearchParams]
  )

  return {
    tickInput,
    setTickInput,
    isTickActive,
    isEventTypeActive,
    hasActiveFilters,
    handleTickApply,
    handleTickKeyDown,
    handleClearTick,
    handleSelectEventType,
    handleClearEventType,
    handleClearAll,
    handleMobileApplyFilters
  }
}
