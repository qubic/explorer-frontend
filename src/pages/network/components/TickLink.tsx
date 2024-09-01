import { Link } from 'react-router-dom'

import { Routes } from '@app/router'
import { clsxTwMerge, formatString } from '@app/utils'

type Props = {
  value: number
  className?: string
}

export default function TickLink({ value, className }: Props) {
  return (
    <Link
      to={Routes.NETWORK.TICK(value)}
      className={clsxTwMerge(`font-space font-500`, className)}
      role="button"
    >
      {formatString(value)}
    </Link>
  )
}
