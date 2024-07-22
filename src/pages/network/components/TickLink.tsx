import { formatString } from '@app/utils'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

type Props = {
  value: number
  className?: string
}

export default function TickLink({ value, className }: Props) {
  return (
    <Link
      // TODO: Put this route in to routes file
      to={`/network/tick/${value}`}
      className={clsx(`font-space font-500`, className)}
      role="button"
    >
      {formatString(value)}
    </Link>
  )
}
