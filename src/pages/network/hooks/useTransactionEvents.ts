import { useMemo } from 'react'

import type { TransactionEvent } from '@app/mocks/generateMockEvents'
import { generateMockEvents } from '@app/mocks/generateMockEvents'
import { useGetTransactionByHashQuery } from '@app/store/apis/query-service'

// TODO: Replace mock generation with real events API endpoint
export default function useTransactionEvents(txId: string): {
  events: TransactionEvent[]
  isLoading: boolean
} {
  const { data: tx, isFetching } = useGetTransactionByHashQuery(txId, {
    skip: !txId
  })

  const events = useMemo(() => (tx ? generateMockEvents([tx]) : []), [tx])

  return { events, isLoading: isFetching }
}
