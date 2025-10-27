import { memo } from 'react'

import { AddressLink } from '@app/pages/network/components'
import { formatString } from '@app/utils'
import type { ExchangeWalletWithBalance } from '../types'

type Props = Readonly<{
  entity: ExchangeWalletWithBalance
  isMobile: boolean
}>

function ExchangeRow({ entity, isMobile }: Props) {
  return (
    <tr key={entity.address} className="border-b border-primary-60 last:border-b-0">
      <td className="whitespace-nowrap px-10 py-16 text-xs sm:p-16 sm:text-sm">{entity.name}</td>
      <td className="px-10 py-16 sm:p-16">
        <AddressLink
          value={entity.address}
          ellipsis={isMobile}
          showTooltip={isMobile}
          className="xs:text-xs sm:text-sm"
          copy
        />
      </td>
      <td className="px-10 py-16 text-right font-space text-xs sm:p-16 sm:text-sm">
        {formatString(entity.balance)}
      </td>
    </tr>
  )
}

const MemoizedExchangeRow = memo(ExchangeRow)

export default MemoizedExchangeRow
