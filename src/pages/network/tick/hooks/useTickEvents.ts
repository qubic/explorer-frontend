import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  usePageAutoCorrect,
  useSanitizedEventTypes,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import {
  useGetEventsQuery,
  type TransactionEvent,
  getLastProcessedTickFromEventsError
} from '@app/store/apis/events'
import type { AddressFilter } from '../../address/components/TransactionsOverview/filterUtils'
import {
  type EventAmountFilter,
  buildAmountFilter,
  buildEventAddressFilter,
  parseAddressFilter,
  parseAmountFilter
} from '../../utils/eventFilterUtils'

export default function useTickEvents(tick: number): {
  events: TransactionEvent[]
  total: number
  eventTypes: number[]
  sourceFilter: AddressFilter | undefined
  destinationFilter: AddressFilter | undefined
  amountFilter: EventAmountFilter | undefined
  isLoading: boolean
  hasError: boolean
  lastProcessedTick: number | null
  validForTick: number | undefined
  refetch: () => void
} {
  const [searchParams] = useSearchParams()

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const eventTypes = useSanitizedEventTypes()

  const sourceFilter = parseAddressFilter(searchParams, 'source', 'sourceMode')
  const destinationFilter = parseAddressFilter(searchParams, 'destination', 'destMode')

  const amountFilter = parseAmountFilter(searchParams)

  const sourceResult = buildEventAddressFilter(sourceFilter)
  const destResult = buildEventAddressFilter(destinationFilter)
  const { amountShould, ...amountParams } = useMemo(
    () => buildAmountFilter(amountFilter),
    [amountFilter]
  )

  const { data, isFetching, isError, error, refetch } = useGetEventsQuery(
    {
      tickNumber: tick,
      offset,
      size: pageSize,
      logType: eventTypes.length > 0 ? eventTypes : undefined,
      source: sourceResult.include,
      excludeSource: sourceResult.exclude,
      destination: destResult.include,
      excludeDestination: destResult.exclude,
      ...(amountShould && { should: amountShould }),
      ...amountParams
    },
    { skip: !tick }
  )

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data, total, pageSize)

  return {
    events: data?.events ?? [],
    total,
    eventTypes,
    sourceFilter,
    destinationFilter,
    amountFilter,
    isLoading: isFetching,
    hasError: isError,
    lastProcessedTick: isError ? getLastProcessedTickFromEventsError(error) : null,
    validForTick: data?.validForTick,
    refetch
  }
}
