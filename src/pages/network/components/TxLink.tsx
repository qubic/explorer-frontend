import { Link } from 'react-router-dom'

import { Tooltip } from '@app/components/ui'
import { CopyTextButton, COPY_BUTTON_TYPES } from '@app/components/ui/buttons'
import { Routes } from '@app/router'
import { clsxTwMerge, formatEllipsis } from '@app/utils'

type Props = {
  value: string
  className?: string
  copy?: boolean
  ellipsis?: boolean
  showTooltip?: boolean
}

export default function TxLink({ value, className, copy, ellipsis, showTooltip = false }: Props) {
  const linkElement = (
    <Link
      className={clsxTwMerge('break-all font-space text-sm', className)}
      to={Routes.NETWORK.TX(value)}
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
      {copy && <CopyTextButton text={value} type={COPY_BUTTON_TYPES.TRANSACTION} />}
    </div>
  )
}
