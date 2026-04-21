import { Link } from 'react-router-dom'

import { Tooltip } from '@app/components/ui'
import { Routes } from '@app/router'
import { clsxTwMerge } from '@app/utils'

function formatVirtualTxEllipsis(str: string): string {
  if (str.length > 20) {
    return `${str.slice(0, 10)}...${str.slice(-10)}`
  }
  return str
}

type Props = Readonly<{
  value: string
  className?: string
}>

export default function VirtualTxLink({ value, className }: Props) {
  return (
    <Tooltip tooltipId="virtual-tx-link" content={value}>
      <Link
        to={Routes.NETWORK.TX(value)}
        className={clsxTwMerge('font-space text-sm text-primary-30', className)}
      >
        {formatVirtualTxEllipsis(value)}
      </Link>
    </Tooltip>
  )
}
