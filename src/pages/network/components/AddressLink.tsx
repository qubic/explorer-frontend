import { Link } from 'react-router-dom'

import { CopyTextButton } from '@app/components/ui/buttons'
import { Routes } from '@app/router'
import { clsxTwMerge, formatEllipsis } from '@app/utils'

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
        className={clsxTwMerge('break-all font-space text-sm text-primary-40', className)}
        to={Routes.NETWORK.ADDRESS(value)}
      >
        {ellipsis ? formatEllipsis(value) : value}
      </Link>
      {copy && <CopyTextButton text={value} />}
    </div>
  )
}
