import { Skeleton } from '@app/components/ui'

const SKELETON_ROW_CELLS = [
  {
    id: 'rank-skeleton-cell',
    className: 'mx-auto size-16 xs:size-20'
  },
  {
    id: 'address-skeleton-cell',
    className:
      'h-16 w-96 xs:h-20 sm:h-40 sm:w-full sm:min-w-[248px] sm:max-w-[532px] md:w-[546px] 827px:h-20'
  },
  {
    id: 'name-skeleton-cell',
    className: 'size-16 xs:size-20 sm:w-84 w-72'
  },
  {
    id: 'amount-skeleton-cell',
    className: 'ml-auto h-16 w-136 xs:h-20'
  }
]

export default function AssetRichListSkeletonRow() {
  return (
    <tr className="border-b border-primary-60">
      {SKELETON_ROW_CELLS.map(({ id, className }) => (
        <td key={id} className="px-8 py-16 sm:p-16">
          <Skeleton className={className} />
        </td>
      ))}
    </tr>
  )
}
