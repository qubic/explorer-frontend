import { Link } from 'react-router-dom'

import { Routes } from '@app/router'
import { clsxTwMerge } from '@app/utils'

type Props = Readonly<{
  tickNumber: number
  logId: number
  className?: string
}>

export default function EventLink({ tickNumber, logId, className }: Props) {
  return (
    <Link
      to={Routes.NETWORK.EVENT(tickNumber, logId)}
      className={clsxTwMerge('font-space text-sm text-primary-30', className)}
    >
      {logId}
    </Link>
  )
}
