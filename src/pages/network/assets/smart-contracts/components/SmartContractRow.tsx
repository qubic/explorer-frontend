import { memo } from 'react'
import { Link } from 'react-router-dom'

import { Routes } from '@app/router/routes'
import { AddressLink } from '@app/pages/network/components'

type Props = Readonly<{
  address: string
  details: { name: string; label: string; contractIndex: number }
  isMobile: boolean
}>

function SmartContractRow({ address, details, isMobile }: Props) {
  return (
    <tr className="border-b border-primary-60 transition-colors last:border-b-0 hover:bg-primary-60/50">
      <td className="px-8 py-16 text-center font-space text-xs xs:text-sm sm:p-16">
        {details.contractIndex}
      </td>
      <td className="px-8 py-16 font-space text-xs xs:text-sm sm:p-16">
        <Link
          to={Routes.NETWORK.ASSETS.SMART_CONTRACT_DETAIL(address)}
          className="text-primary-30 hover:underline"
        >
          {details.name}
        </Link>
      </td>
      <td className="px-8 py-16 font-space text-xs xs:text-sm sm:p-16">
        <AddressLink value={address} ellipsis={isMobile} showTooltip={isMobile} copy />
      </td>
    </tr>
  )
}

const MemoizedSmartContractRow = memo(SmartContractRow)

export default MemoizedSmartContractRow
