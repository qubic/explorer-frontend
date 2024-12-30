import { memo } from 'react'

import { AddressLink } from '@app/pages/network/components'
import type { Asset } from '@app/store/apis/qx'

type Props = Readonly<{
  asset: Asset
  isMobile: boolean
}>

function SmartContractRow({ asset, isMobile }: Props) {
  return (
    <tr className="border-b border-primary-60 last:border-b-0">
      <td className="px-8 py-16 font-space text-xs xs:text-sm sm:p-16">{asset.name}</td>
      <td className="px-8 py-16 text-right font-space text-xs xs:text-sm sm:p-16">
        <AddressLink value={asset.issuer} ellipsis={isMobile} showTooltip={isMobile} />
      </td>
    </tr>
  )
}

const MemoizedSmartContractRow = memo(SmartContractRow)

export default MemoizedSmartContractRow
