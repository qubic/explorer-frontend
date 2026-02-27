import Skeleton from './Skeleton'

type Cell = Readonly<{
  id: string
  className: string
}>

type Props = Readonly<{
  cells: Cell[]
}>

export default function TableSkeletonRow({ cells }: Props) {
  return (
    <tr className="border-b border-primary-60">
      {cells.map(({ id, className }) => (
        <td key={id} className="px-8 py-16 sm:p-16">
          <Skeleton className={className} />
        </td>
      ))}
    </tr>
  )
}
