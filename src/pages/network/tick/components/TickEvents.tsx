import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useTickEvents } from '../hooks'

type Props = Readonly<{
  tick: number
}>

export default function TickEvents({ tick }: Props) {
  const { events, isLoading } = useTickEvents(tick)

  return <TransactionEvents events={events} isLoading={isLoading} paginated />
}
