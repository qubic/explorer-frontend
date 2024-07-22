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

function AddressLink({ value, copy, ellipsis, className }: Props) {
  return (
    <div className="flex gap-10 items-center">
      <Link
        className={clsx('text-14 leading-20 font-space text-primary-40 break-all', className)}
        to={`/network/address/${value}`}
        role="button"
      >
        {ellipsis ? formatEllipsis(value) : value}
      </Link>
      {copy && <CopyText text={value} />}
    </div>
  )
}
export default AddressLink
