import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useValidatedPage, useValidatedPageSize } from '@app/hooks'
import { useGetEventsQuery, type TransactionEvent } from '@app/store/apis/events'

export default function useTransactionEvents(txId: string): {
  events: TransactionEvent[]
  total: number
  isLoading: boolean
} {
  const [, setSearchParams] = useSearchParams()
  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const { data, isFetching } = useGetEventsQuery(
    { transactionHash: txId, offset, size: pageSize },
    { skip: !txId }
  )

  const total = data?.total ?? 0
  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  // Auto-correct page if it exceeds available pages (e.g. direct URL entry with stale page param)
  useEffect(() => {
    if (data && page > maxPage) {
      setSearchParams(
        (prev) => {
          prev.delete('page')
          return prev
        },
        { replace: true }
      )
    }
  }, [data, page, maxPage, setSearchParams])

  return {
    events: data?.events ?? [],
    total,
    isLoading: isFetching
  }
}
