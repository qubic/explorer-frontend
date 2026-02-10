import { Skeleton } from '@app/components/ui'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useTickEvents } from '../hooks'

type Props = Readonly<{
  tick: number
}>

export default function TickEvents({ tick }: Props) {
  const { events, isLoading } = useTickEvents(tick)

  if (isLoading) {
    return (
      <div className="grid gap-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={String(`skeleton-${i}`)} className="h-48" />
        ))}
      </div>
    )
  }

  return <TransactionEvents events={events} paginated />
}
