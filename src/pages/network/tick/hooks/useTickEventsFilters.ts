import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { updateSearchParams } from '../../utils/filterUtils'

export default function useTickEventsFilters(eventType: number | undefined) {
  const [, setSearchParams] = useSearchParams()

  const isActive = eventType !== undefined

  const handleSelect = useCallback(
    (type: number) => {
      setSearchParams((prev) => updateSearchParams(prev, { eventType: String(type) }))
    },
    [setSearchParams]
  )

  const handleClear = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, { eventType: undefined }))
  }, [setSearchParams])

  const handleMobileApply = useCallback(
    (type: number | undefined) => {
      setSearchParams((prev) =>
        updateSearchParams(prev, {
          eventType: type !== undefined ? String(type) : undefined
        })
      )
    },
    [setSearchParams]
  )

  return {
    isActive,
    handleSelect,
    handleClear,
    handleMobileApply
  }
}
