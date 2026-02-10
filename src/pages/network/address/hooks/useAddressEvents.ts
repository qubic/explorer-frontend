import { useMemo } from 'react'

import type { TransactionEvent } from '@app/mocks/generateMockEvents'
import { generateMockEvents } from '@app/mocks/generateMockEvents'
import useLatestTransactions from './useLatestTransactions'

// TODO: Replace mock generation with real events API endpoint
export default function useAddressEvents(addressId: string): {
  events: TransactionEvent[]
  isLoading: boolean
} {
  const { transactions, isLoading } = useLatestTransactions(addressId)

  const events = useMemo(() => generateMockEvents(transactions), [transactions])

  return { events, isLoading: isLoading && transactions.length === 0 }
}
