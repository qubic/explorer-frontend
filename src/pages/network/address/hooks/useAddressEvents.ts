import { useEffect, useMemo, useState } from 'react'

import type { TransactionEvent } from '@app/mocks/generateMockEvents'
import { generateMockEvents } from '@app/mocks/generateMockEvents'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { useGetTransactionsForIdentityMutation } from '@app/store/apis/query-service'

// TODO: Replace mock generation with real events API endpoint
export default function useAddressEvents(addressId: string): {
  events: TransactionEvent[]
  isLoading: boolean
} {
  const [getTransactions] = useGetTransactionsForIdentityMutation()
  const [transactions, setTransactions] = useState<QueryServiceTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!addressId) return undefined

    let cancelled = false
    setIsLoading(true)

    getTransactions({
      identity: addressId,
      pagination: { offset: 0, size: 100 }
    })
      .unwrap()
      .then((result) => {
        if (!cancelled) {
          setTransactions(result.transactions ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTransactions([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [addressId, getTransactions])

  const events = useMemo(() => generateMockEvents(transactions), [transactions])

  return { events, isLoading }
}
