import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { parseEventTypesParam } from '@app/store/apis/events'

export function useSanitizedEventTypes(): number[] {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawEventType = searchParams.get('eventType')
  const eventTypes = useMemo(() => parseEventTypesParam(rawEventType), [rawEventType])

  useEffect(() => {
    if (rawEventType === null) return

    const sanitized = eventTypes.join(',')
    if (eventTypes.length === 0) {
      // All values were invalid — remove param
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('eventType')
          return next
        },
        { replace: true }
      )
    } else if (sanitized !== rawEventType) {
      // Some values were invalid or duplicated — fix param
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('eventType', sanitized)
          return next
        },
        { replace: true }
      )
    }
  }, [rawEventType, eventTypes, setSearchParams])

  return eventTypes
}
