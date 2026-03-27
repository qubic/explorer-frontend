import { usePageAutoCorrect, useValidatedPage, useValidatedPageSize } from '@app/hooks'
import {
  useGetEventsQuery,
  type TransactionEvent,
  getLastProcessedTickFromEventsError
} from '@app/store/apis/events'

export default function useTransactionEvents(txId: string): {
  events: TransactionEvent[]
  total: number
  isLoading: boolean
  hasError: boolean
  lastProcessedTick: number | null
} {
  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const { data, isFetching, isError, error } = useGetEventsQuery(
    { transactionHash: txId, offset, size: pageSize },
    { skip: !txId }
  )

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data, total, pageSize)

  return {
    events: data?.events ?? [],
    total,
    isLoading: isFetching,
    hasError: isError,
    lastProcessedTick: isError ? getLastProcessedTickFromEventsError(error) : null
  }
}
