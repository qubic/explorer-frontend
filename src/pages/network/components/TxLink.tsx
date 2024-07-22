import { formatEllipsis } from '@app/utils'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import CopyText from './CopyText'

type Props = {
  value: string
  className?: string
  copy?: boolean
  ellipsis?: boolean
  isHistoricalTx?: boolean
}

export default function TxLink({
  value,
  className,
  copy,
  ellipsis,
  isHistoricalTx = false
}: Props) {
  return (
    <div className="flex gap-10 items-center">
      <Link
        className={clsx('font-space break-all', className)}
        to={`/network/tx/${value}?type=${isHistoricalTx ? 'historical' : 'latest'}`}
        role="button"
      >
        {ellipsis ? formatEllipsis(value) : value}
      </Link>
      {copy && <CopyText text={value} />}
    </div>
  )
}
