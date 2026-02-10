import { useMemo } from 'react'

import type { TransactionEvent } from '@app/mocks/generateMockEvents'
import { generateMockEvents } from '@app/mocks/generateMockEvents'
import { useGetTransactionsForTickQuery } from '@app/store/apis/query-service'

// TODO: Replace mock generation with real events API endpoint
export default function useTickEvents(tick: number): {
  events: TransactionEvent[]
  isLoading: boolean
} {
  const { data: transactions, isFetching } = useGetTransactionsForTickQuery(
    { tickNumber: tick },
    { skip: !tick }
  )

  const events = useMemo(
    () => (transactions ? generateMockEvents(transactions) : []),
    [transactions]
  )

  return { events, isLoading: isFetching }
}
