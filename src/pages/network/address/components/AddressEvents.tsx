import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useAddressEvents } from '../hooks'

type Props = Readonly<{ addressId: string }>

export default function AddressEvents({ addressId }: Props) {
  const { events, isLoading } = useAddressEvents(addressId)

  return (
    <TransactionEvents
      events={events}
      isLoading={isLoading}
      paginated
      highlightAddress={addressId}
      showTickAndTimestamp
    />
  )
}
