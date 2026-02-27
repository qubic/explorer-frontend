import { memo } from 'react'

import { TableSkeletonRow } from '@app/components/ui'

const RICH_LIST_SKELETON_CELLS = [
  { id: 'rank-skeleton-cell', className: 'mx-auto size-16 xs:size-20' },
  {
    id: 'address-skeleton-cell',
    className:
      'h-16 w-96 xs:h-20 sm:h-40 sm:w-full sm:min-w-[248px] sm:max-w-[532px] md:w-[546px] 827px:h-20'
  },
  { id: 'name-skeleton-cell', className: 'size-16 xs:size-20 sm:w-84 w-72' },
  { id: 'amount-skeleton-cell', className: 'ml-auto h-16 w-136 xs:h-20' }
]

const RichListLoadingRows = memo(({ pageSize }: { pageSize: number }) =>
  Array.from({ length: pageSize }).map((_, index) => (
    <TableSkeletonRow key={String(`${index}`)} cells={RICH_LIST_SKELETON_CELLS} />
  ))
)

export default RichListLoadingRows
