import { Routes } from '@app/router'
import { formatEllipsis } from '@app/utils'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import CopyText from './CopyText'

type Props = {
  value: string
  copy?: boolean
  ellipsis?: boolean
  className?: string
}

export default function AddressLink({ value, copy, ellipsis, className }: Props) {
  return (
    <div className="flex items-center gap-10">
      <Link
        role="button"
        className={clsx('break-all font-space text-sm text-primary-40', className)}
        to={Routes.NETWORK.ADDRESS(value)}
      >
        {ellipsis ? formatEllipsis(value) : value}
      </Link>
      {copy && <CopyText text={value} />}
    </div>
  )
}
