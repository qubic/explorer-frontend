import { useSearchParams } from 'react-router-dom'

import { DEFAULT_PAGE_SIZE } from '@app/constants'
import { useGetEventsByTickQuery, type TransactionEvent } from '@app/store/apis/events'

export default function useTickEvents(tick: number): {
  events: TransactionEvent[]
  total: number
  eventType: number | undefined
  isLoading: boolean
} {
  const [searchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10) || 1
  const pageSize =
    parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE
  const offset = (page - 1) * pageSize

  const rawEventType = searchParams.get('eventType')
  const eventType = rawEventType !== null ? Number(rawEventType) : undefined

  const { data, isFetching } = useGetEventsByTickQuery(
    { tickNumber: tick, offset, size: pageSize, eventType },
    { skip: !tick }
  )

  return {
    events: data?.events ?? [],
    total: data?.total ?? 0,
    eventType,
    isLoading: isFetching
  }
}
