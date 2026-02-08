import { Skeleton } from '@app/components/ui'

const SKELETON_CELLS = [
  { id: 'status', className: 'mx-auto size-20' },
  { id: 'txId', className: 'h-16 w-80 xs:h-20' },
  { id: 'type', className: 'h-16 w-64 xs:h-20' },
  { id: 'tick', className: 'h-16 w-64 xs:h-20' },
  { id: 'timestamp', className: 'h-16 w-56 xs:h-20' },
  { id: 'source', className: 'h-16 w-80 xs:h-20' },
  { id: 'destination', className: 'h-16 w-80 xs:h-20' },
  { id: 'amount', className: 'ml-auto h-16 w-96 xs:h-20' }
]

export default function TransactionSkeletonRow() {
  return (
    <tr className="border-b border-primary-60">
      {SKELETON_CELLS.map(({ id, className }) => (
        <td key={id} className="px-8 py-12 sm:px-16">
          <Skeleton className={className} />
        </td>
      ))}
    </tr>
  )
}
