import { useMemo } from 'react'

import type { TransactionEvent } from '@app/mocks/generateMockEvents'
import mockEvents from '@app/mocks/transaction-events.json'

// TODO: Replace static mock data with real events API endpoint
export default function useTransactionEvents(txId: string): {
  events: TransactionEvent[]
  isLoading: boolean
} {
  const events = useMemo(() => (txId ? mockEvents : []), [txId])
  return { events, isLoading: false }
}
