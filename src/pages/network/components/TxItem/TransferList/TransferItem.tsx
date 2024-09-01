import { memo } from 'react'

import { clsxTwMerge, formatString } from '@app/utils'
import type { Transfer } from '@app/utils/qubic-ts'
import AddressLink from '../../AddressLink'

function TransferItem({ transfer, className }: { transfer: Transfer; className?: string }) {
  return (
    <li className={clsxTwMerge('flex flex-col justify-between gap-8 md:flex-row', className)}>
      <AddressLink value={transfer.destId} />
      <p className="font-space text-sm">{formatString(transfer.amount)} QUBIC</p>
    </li>
  )
}

const MemoizedTransferItem = memo(TransferItem)

export default MemoizedTransferItem
