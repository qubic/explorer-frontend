import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  usePageAutoCorrect,
  useSanitizedEventType,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import { type ShouldFilter, type TransactionEvent, useGetEventsQuery } from '@app/store/apis/events'
import type { AddressFilter } from '../components/TransactionsOverview/filterUtils'
import {
  buildEventAddressFilter,
  buildTickFilter,
  buildTimestampRange,
  type DateRangeValue,
  parseAddressFilter,
  parseDateRange,
  parseTickRange
} from '../../utils/eventFilterUtils'

export default function useAddressEvents(addressId: string): {
  events: TransactionEvent[]
  total: number
  eventType: number | undefined
  tickStart: string | undefined
  tickEnd: string | undefined
  dateRange: DateRangeValue | undefined
  sourceFilter: AddressFilter | undefined
  destinationFilter: AddressFilter | undefined
  isLoading: boolean
  hasError: boolean
} {
  const [searchParams] = useSearchParams()

  const { start: tickStart, end: tickEnd } = parseTickRange(searchParams)

  const dateRange = parseDateRange(searchParams)
  const sourceFilter = parseAddressFilter(searchParams, 'source', 'sourceMode')
  const destinationFilter = parseAddressFilter(searchParams, 'destination', 'destMode')

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const eventType = useSanitizedEventType()

  const should = useMemo<ShouldFilter[]>(
    () => [{ terms: { source: addressId, destination: addressId } }],
    [addressId]
  )

  const { tickNumber, tickRange } = buildTickFilter(tickStart, tickEnd)

  const timestampRange = buildTimestampRange(dateRange)
  const sourceResult = buildEventAddressFilter(sourceFilter)
  const destResult = buildEventAddressFilter(destinationFilter)

  const { data, isFetching, isError } = useGetEventsQuery(
    {
      should,
      tickNumber,
      tickRange,
      timestampRange,
      offset,
      size: pageSize,
      logType: eventType,
      source: sourceResult.include,
      excludeSource: sourceResult.exclude,
      destination: destResult.include,
      excludeDestination: destResult.exclude
    },
    { skip: !addressId }
  )

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data, total, pageSize)

  return {
    events: data?.events ?? [],
    total,
    eventType,
    tickStart,
    tickEnd,
    dateRange,
    sourceFilter,
    destinationFilter,
    isLoading: isFetching,
    hasError: isError
  }
}
