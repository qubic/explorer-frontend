import { memo, useMemo } from 'react'

import { AddressLink } from '@app/pages/network/components'
import type { Entity } from '@app/store/apis/archiver-v1'
import { formatString } from '@app/utils'
import { getAddressName } from '@app/utils/qubic'

type Props = {
  entity: Entity & { rank: number }
  isMobile: boolean
}

function RichListRow({ entity, isMobile }: Props) {
  const addressName = useMemo(() => getAddressName(entity.identity), [entity.identity])

  return (
    <tr key={entity.identity} className="border-b border-primary-60">
      <td className="px-8 py-16 text-center font-space text-xs xs:text-sm sm:p-16">
        {entity.rank}
      </td>
      <td className="px-8 py-16 sm:p-16">
        <AddressLink value={entity.identity} ellipsis={isMobile} showTooltip={isMobile} />
      </td>
      <td className="whitespace-nowrap px-8 py-16 font-space text-xs xs:text-sm sm:p-16">
        {addressName ? addressName.name : ''}
      </td>
      <td className="px-8 py-16 text-right font-space text-xs xs:text-sm sm:p-16">
        {formatString(entity.balance)}
      </td>
    </tr>
  )
}

const MemoizedRichListRow = memo(RichListRow)

export default MemoizedRichListRow
