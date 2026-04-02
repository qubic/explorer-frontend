import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  usePageAutoCorrect,
  useSanitizedEventTypes,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import {
  type ShouldFilter,
  type TransactionEvent,
  useGetEventsQuery,
  getLastProcessedTickFromEventsError
} from '@app/store/apis/events'
import type {
  AddressFilter,
  TransactionDirection
} from '../components/TransactionsOverview/filterUtils'
import { DIRECTION } from '../components/TransactionsOverview/filterUtils'
import {
  type EventAmountFilter,
  buildAmountFilter,
  buildEventAddressFilter,
  buildTickFilter,
  buildTimestampRange,
  type DateRangeValue,
  parseAddressFilter,
  parseAmountFilter,
  parseDateRange,
  parseTickRange
} from '../../utils/eventFilterUtils'

export default function useAddressEvents(addressId: string): {
  events: TransactionEvent[]
  total: number
  eventTypes: number[]
  direction: TransactionDirection | undefined
  tickStart: string | undefined
  tickEnd: string | undefined
  dateRange: DateRangeValue | undefined
  sourceFilter: AddressFilter | undefined
  destinationFilter: AddressFilter | undefined
  amountFilter: EventAmountFilter | undefined
  isLoading: boolean
  hasError: boolean
  lastProcessedTick: number | null
  validForTick: number | undefined
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

  const directionRaw = searchParams.get('direction')
  const direction: TransactionDirection | undefined =
    directionRaw === DIRECTION.INCOMING || directionRaw === DIRECTION.OUTGOING
      ? directionRaw
      : undefined

  const amountFilter = parseAmountFilter(searchParams)

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

  const addressShould = useMemo<ShouldFilter[] | undefined>(
    () =>
      useShouldFilter ? [{ terms: { source: addressId, destination: addressId } }] : undefined,
    [addressId, useShouldFilter]
  )

  const { amountShould, ...amountParams } = useMemo(
    () => buildAmountFilter(amountFilter),
    [amountFilter]
  )

  // Merge address should (OR) with amount should (OR) when both are present
  const should = useMemo<ShouldFilter[] | undefined>(() => {
    if (!addressShould && !amountShould) return undefined
    return [...(addressShould ?? []), ...(amountShould ?? [])]
  }, [addressShould, amountShould])

  // When direction is set, implicit source/dest scopes to the page address.
  // When direction is undefined, `should` (OR) handles scoping instead.
  const implicitSource = isOutgoing ? addressId : undefined
  const implicitDest = isIncoming ? addressId : undefined

  const { data, isFetching, isError, error } = useGetEventsQuery(
    {
      should,
      tickNumber,
      tickRange,
      timestampRange,
      offset,
      size: pageSize,
      logType: eventTypes.length > 0 ? eventTypes : undefined,
      source: sourceResult.include ?? implicitSource,
      excludeSource: sourceResult.exclude,
      destination: destResult.include ?? implicitDest,
      excludeDestination: destResult.exclude,
      ...amountParams
    },
    { skip: !addressId }
  )

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data, total, pageSize)

  return {
    events: data?.events ?? [],
    total,
    eventTypes,
    direction,
    tickStart,
    tickEnd,
    dateRange,
    sourceFilter,
    destinationFilter,
    amountFilter,
    isLoading: isFetching,
    hasError: isError,
    lastProcessedTick: isError ? getLastProcessedTickFromEventsError(error) : null,
    validForTick: data?.validForTick
  }
}
