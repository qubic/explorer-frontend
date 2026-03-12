import { useSearchParams } from 'react-router-dom'

import {
  usePageAutoCorrect,
  useSanitizedEventTypes,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import { useGetEventsQuery, type TransactionEvent } from '@app/store/apis/events'
import type { AddressFilter } from '../../address/components/TransactionsOverview/filterUtils'
import { buildEventAddressFilter, parseAddressFilter } from '../../utils/eventFilterUtils'

export default function useTickEvents(tick: number): {
  events: TransactionEvent[]
  total: number
  eventTypes: number[]
  sourceFilter: AddressFilter | undefined
  destinationFilter: AddressFilter | undefined
  isLoading: boolean
  hasError: boolean
  refetch: () => void
} {
  const [searchParams] = useSearchParams()

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const eventTypes = useSanitizedEventTypes()

  const sourceFilter = parseAddressFilter(searchParams, 'source', 'sourceMode')
  const destinationFilter = parseAddressFilter(searchParams, 'destination', 'destMode')

  const sourceResult = buildEventAddressFilter(sourceFilter)
  const destResult = buildEventAddressFilter(destinationFilter)

  const { data, isFetching, isError, refetch } = useGetEventsQuery(
    {
      tickNumber: tick,
      offset,
      size: pageSize,
      logType: eventTypes.length > 0 ? eventTypes : undefined,
      source: sourceResult.include,
      excludeSource: sourceResult.exclude,
      destination: destResult.include,
      excludeDestination: destResult.exclude
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
    isLoading: isFetching,
    hasError: isError,
    refetch
  }
}
