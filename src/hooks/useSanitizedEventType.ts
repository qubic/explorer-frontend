import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { parseEventTypeParam } from '@app/store/apis/events'

export function useSanitizedEventType(): number | undefined {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawEventType = searchParams.get('eventType')
  const eventType = parseEventTypeParam(rawEventType)

  useEffect(() => {
    if (rawEventType !== null && eventType === undefined) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('eventType')
          return next
        },
        { replace: true }
      )
    }
  }, [rawEventType, eventType, setSearchParams])

  return eventType
}
