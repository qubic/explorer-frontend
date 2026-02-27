import { useSearchParams } from 'react-router-dom'

import {
  usePageAutoCorrect,
  useSanitizedEventType,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import { useGetEventsQuery, type TransactionEvent } from '@app/store/apis/events'

export default function useEventsPage(): {
  events: TransactionEvent[]
  total: number
  eventType: number | undefined
  tick: number | undefined
  isLoading: boolean
} {
  const [searchParams] = useSearchParams()

  const rawTick = searchParams.get('tick')
  const parsedTick = rawTick ? parseInt(rawTick, 10) : NaN
  const tick = Number.isFinite(parsedTick) && parsedTick > 0 ? parsedTick : undefined

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const eventType = useSanitizedEventType()

  const { data, isFetching } = useGetEventsQuery({
    tickNumber: tick,
    offset,
    size: pageSize,
    eventType
  })

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data, total, pageSize)

  return {
    events: data?.events ?? [],
    total,
    eventType,
    tick,
    isLoading: isFetching
  }
}
