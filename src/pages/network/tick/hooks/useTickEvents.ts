import {
  usePageAutoCorrect,
  useSanitizedEventType,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import { useGetEventsQuery, type TransactionEvent } from '@app/store/apis/events'

export default function useTickEvents(tick: number): {
  events: TransactionEvent[]
  total: number
  eventType: number | undefined
  isLoading: boolean
  hasError: boolean
  refetch: () => void
} {
  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const eventType = useSanitizedEventType()

  const { data, isFetching, isError, refetch } = useGetEventsQuery(
    { tickNumber: tick, offset, size: pageSize, eventType },
    { skip: !tick }
  )

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data, total, pageSize)

  return {
    events: data?.events ?? [],
    total,
    eventType,
    isLoading: isFetching,
    hasError: isError,
    refetch
  }
}
