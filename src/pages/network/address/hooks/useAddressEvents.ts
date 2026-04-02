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

  const hasExplicitSource = !!sourceResult.include || !!sourceResult.exclude
  const hasExplicitDest = !!destResult.include || !!destResult.exclude

  // When a source or destination filter is explicitly set, we can't use `should` (OR)
  // because it would return events outside the page address scope.
  // Instead, fill the opposite field with the page address to keep results scoped.
  const useShouldFilter = !direction && !hasExplicitSource && !hasExplicitDest

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

  // Determine source/destination values for the API request:
  // 1. Direction set → implicit source or dest is the page address
  // 2. Explicit filter set → use it, and scope the opposite side to the page address
  // 3. Neither → `should` (OR) handles scoping
  const resolvedSource = useMemo(() => {
    if (sourceResult.include) return sourceResult.include
    if (isOutgoing) return addressId
    if (hasExplicitDest) return addressId
    return undefined
  }, [sourceResult.include, isOutgoing, hasExplicitDest, addressId])

  const resolvedDest = useMemo(() => {
    if (destResult.include) return destResult.include
    if (isIncoming) return addressId
    if (hasExplicitSource) return addressId
    return undefined
  }, [destResult.include, isIncoming, hasExplicitSource, addressId])

  const { data, isFetching, isError, error } = useGetEventsQuery(
    {
      should,
      tickNumber,
      tickRange,
      timestampRange,
      offset,
      size: pageSize,
      logType: eventTypes.length > 0 ? eventTypes : undefined,
      source: resolvedSource,
      excludeSource: sourceResult.exclude,
      destination: resolvedDest,
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
