import { useGetEventsByTxHashQuery, type TransactionEvent } from '@app/store/apis/events'

export default function useTransactionEvents(txId: string): {
  events: TransactionEvent[]
  isLoading: boolean
} {
  const { data: events, isFetching } = useGetEventsByTxHashQuery(txId, {
    skip: !txId
  })

  return { events: events ?? [], isLoading: isFetching }
}
