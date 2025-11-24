import { memo } from 'react'

import { AddressLink } from '@app/pages/network/components'
import type { Owner } from '@app/store/apis/archiver-v1'
import { formatString } from '@app/utils'
import { useGetAddressName } from '@app/hooks'

type Props = {
  entity: Owner & { rank: number }
  isMobile: boolean
}

function AssetRichListRow({ entity, isMobile }: Props) {
  const addressNameData = useGetAddressName(entity.identity)

  return (
    <tr key={entity.identity} className="border-b border-primary-60">
      <td className="px-8 py-16 text-center font-space text-xs xs:text-sm sm:p-16">
        {entity.rank}
      </td>
      <td className="px-8 py-16 sm:p-16">
        <AddressLink value={entity.identity} ellipsis={isMobile} showTooltip={isMobile} copy />
      </td>
      <td className="whitespace-nowrap px-8 py-16 font-space text-xs xs:text-sm sm:p-16">
        {addressNameData?.name || ''}
      </td>
      <td className="px-8 py-16 text-right font-space text-xs xs:text-sm sm:p-16">
        {formatString(entity.numberOfShares)}
      </td>
    </tr>
  )
}

const MemoizedAssetRichListRow = memo(AssetRichListRow)

export default MemoizedAssetRichListRow
