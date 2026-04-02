import { Link } from 'react-router-dom'

import { Routes } from '@app/router'
import { clsxTwMerge } from '@app/utils'

type Props = Readonly<{
  value: string
  className?: string
}>

export default function VirtualTxLink({ value, className }: Props) {
  return (
    <Link
      to={Routes.NETWORK.TX(value)}
      className={clsxTwMerge('font-space text-sm text-primary-30', className)}
    >
      {value}
    </Link>
  )
}
