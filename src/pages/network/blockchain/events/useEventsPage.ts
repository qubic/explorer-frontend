import { useSearchParams } from 'react-router-dom'

import {
  usePageAutoCorrect,
  useSanitizedEventTypes,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import { type TransactionEvent, useGetEventsQuery } from '@app/store/apis/events'
import type { AddressFilter } from '../../address/components/TransactionsOverview/filterUtils'
import {
  buildEventAddressFilter,
  buildTickFilter,
  buildTimestampRange,
  type DateRangeValue,
  parseAddressFilter,
  parseDateRange,
  parseTickRange
} from '../../utils/eventFilterUtils'

export default function useEventsPage(): {
  events: TransactionEvent[]
  total: number
  eventTypes: number[]
  tickStart: string | undefined
  tickEnd: string | undefined
  dateRange: DateRangeValue | undefined
  sourceFilter: AddressFilter | undefined
  destinationFilter: AddressFilter | undefined
  isLoading: boolean
} {
  const [searchParams] = useSearchParams()

  const { start: tickStart, end: tickEnd } = parseTickRange(searchParams)

  const dateRange = parseDateRange(searchParams)
  const sourceFilter = parseAddressFilter(searchParams, 'source', 'sourceMode')
  const destinationFilter = parseAddressFilter(searchParams, 'destination', 'destMode')

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const eventTypes = useSanitizedEventTypes()

  const { tickNumber, tickRange } = buildTickFilter(tickStart, tickEnd)

  const timestampRange = buildTimestampRange(dateRange)
  const sourceResult = buildEventAddressFilter(sourceFilter)
  const destResult = buildEventAddressFilter(destinationFilter)

  const { data, isFetching } = useGetEventsQuery({
    tickNumber,
    tickRange,
    timestampRange,
    offset,
    size: pageSize,
    logType: eventTypes.length > 0 ? eventTypes : undefined,
    source: sourceResult.include,
    excludeSource: sourceResult.exclude,
    destination: destResult.include,
    excludeDestination: destResult.exclude
  })

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data, total, pageSize)

  return {
    events: data?.events ?? [],
    total,
    eventTypes,
    tickStart,
    tickEnd,
    dateRange,
    sourceFilter,
    destinationFilter,
    isLoading: isFetching
  }
}
