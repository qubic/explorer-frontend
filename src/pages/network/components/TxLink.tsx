import { Link } from 'react-router-dom'

import { Tooltip } from '@app/components/ui'
import { CopyTextButton } from '@app/components/ui/buttons'
import { Routes } from '@app/router'
import type { NetworkTxQueryParams } from '@app/router/routes'
import { clsxTwMerge, formatEllipsis } from '@app/utils'

type Props = {
  value: string
  className?: string
  copy?: boolean
  ellipsis?: boolean
  isHistoricalTx?: boolean
  showTooltip?: boolean
}

export default function TxLink({
  value,
  className,
  copy,
  ellipsis,
  isHistoricalTx = false,
  showTooltip = false
}: Props) {
  const queryParams: NetworkTxQueryParams = {
    type: isHistoricalTx ? 'historical' : 'latest'
  }

  const linkElement = (
    <Link
      className={clsxTwMerge('break-all font-space text-sm', className)}
      to={Routes.NETWORK.TX(value, queryParams)}
    >
      {ellipsis ? formatEllipsis(value) : value}
    </Link>
  )

  return (
    <div className="flex items-center gap-10">
      {showTooltip ? (
        <Tooltip tooltipId="tx-link" content={value}>
          {linkElement}
        </Tooltip>
      ) : (
        linkElement
      )}
      {copy && <CopyTextButton text={value} />}
    </div>
  )
}
