import { memo } from 'react'

import { AddressLink } from '@app/pages/network/components'
import type { IssuedAsset } from '@app/store/apis/archiver-v1'

type Props = Readonly<{
  asset: IssuedAsset
  isMobile: boolean
}>

function TokenRow({ asset, isMobile }: Props) {
  return (
    <tr className="border-b border-primary-60 last:border-b-0">
      <td className="px-8 py-16 font-space text-xs xs:text-sm sm:p-16">{asset.name}</td>
      <td className="px-8 py-16 text-right font-space text-xs xs:text-sm sm:p-16">
        <AddressLink value={asset.issuerIdentity} ellipsis={isMobile} showTooltip={isMobile} />
      </td>
    </tr>
  )
}

const MemoizedTokenRow = memo(TokenRow)

export default MemoizedTokenRow
