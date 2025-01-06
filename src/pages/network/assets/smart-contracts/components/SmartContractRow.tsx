import { memo } from 'react'

import { AddressLink } from '@app/pages/network/components'

type Props = Readonly<{
  address: string
  details: { name: string; label: string }
  isMobile: boolean
}>

function SmartContractRow({ address, details, isMobile }: Props) {
  return (
    <tr className="border-b border-primary-60 last:border-b-0">
      <td className="px-8 py-16 font-space text-xs xs:text-sm sm:p-16">{details.name}</td>
      <td className="px-8 py-16 text-right font-space text-xs xs:text-sm sm:p-16">
        <AddressLink value={address} ellipsis={isMobile} showTooltip={isMobile} />
      </td>
    </tr>
  )
}

const MemoizedSmartContractRow = memo(SmartContractRow)

export default MemoizedSmartContractRow
