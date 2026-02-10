import { Skeleton } from '@app/components/ui'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useAddressEvents } from '../hooks'

type Props = Readonly<{ addressId: string }>

export default function AddressEvents({ addressId }: Props) {
  const { events, isLoading } = useAddressEvents(addressId)

  if (isLoading) {
    return (
      <div className="grid gap-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={String(`skeleton-${i}`)} className="h-48" />
        ))}
      </div>
    )
  }

  return (
    <TransactionEvents
      events={events}
      paginated
      highlightAddress={addressId}
      showTickAndTimestamp
    />
  )
}
