import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  usePageAutoCorrect,
  useSanitizedEventType,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import { type ShouldFilter, type TransactionEvent, useGetEventsQuery } from '@app/store/apis/events'
import type {
  AddressFilter,
  TransactionDirection
} from '../components/TransactionsOverview/filterUtils'
import { DIRECTION } from '../components/TransactionsOverview/filterUtils'
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
  direction: TransactionDirection | undefined
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

  const directionRaw = searchParams.get('direction')
  const direction: TransactionDirection | undefined =
    directionRaw === DIRECTION.INCOMING || directionRaw === DIRECTION.OUTGOING
      ? directionRaw
      : undefined

  const { tickNumber, tickRange } = buildTickFilter(tickStart, tickEnd)

  const timestampRange = buildTimestampRange(dateRange)

  // When direction is set, the conflicting filter is ignored (disabled in UI).
  const isIncoming = direction === DIRECTION.INCOMING
  const isOutgoing = direction === DIRECTION.OUTGOING

  const effectiveSourceFilter = isOutgoing ? undefined : sourceFilter
  const effectiveDestFilter = isIncoming ? undefined : destinationFilter

  const sourceResult = buildEventAddressFilter(effectiveSourceFilter)
  const destResult = buildEventAddressFilter(effectiveDestFilter)

  // Use `should` (OR) to scope results to the page address when no explicit direction is set.
  // When direction is set, implicit source/dest handles the scoping instead.
  const useShouldFilter = !direction

  const should = useMemo<ShouldFilter[] | undefined>(
    () =>
      useShouldFilter ? [{ terms: { source: addressId, destination: addressId } }] : undefined,
    [addressId, useShouldFilter]
  )

  // When direction is set, implicit source/dest scopes to the page address.
  // When direction is undefined, `should` (OR) handles scoping instead.
  const implicitSource = isOutgoing ? addressId : undefined
  const implicitDest = isIncoming ? addressId : undefined

  const { data, isFetching, isError } = useGetEventsQuery(
    {
      should,
      tickNumber,
      tickRange,
      timestampRange,
      offset,
      size: pageSize,
      logType: eventType,
      source: sourceResult.include ?? implicitSource,
      excludeSource: sourceResult.exclude,
      destination: destResult.include ?? implicitDest,
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
    direction,
    tickStart,
    tickEnd,
    dateRange,
    sourceFilter,
    destinationFilter,
    isLoading: isFetching,
    hasError: isError
  }
}
