import { Link } from 'react-router-dom'

import { Tooltip } from '@app/components/ui'
import { CopyTextButton } from '@app/components/ui/buttons'
import { Routes } from '@app/router'
import { clsxTwMerge, formatEllipsis } from '@app/utils'
import { useMemo } from 'react'

type Props = {
  value: string
  label?: string
  copy?: boolean
  ellipsis?: boolean
  className?: string
  showTooltip?: boolean
}

export default function AddressLink({
  value,
  label,
  className,
  copy = false,
  ellipsis = false,
  showTooltip = false
}: Props) {
  const addressLink = useMemo(() => {
    const getDisplayValue = () => {
      if (label) {
        return label
      }
      if (ellipsis) {
        return formatEllipsis(value)
      }
      return value
    }

    return (
      <div className="flex items-center gap-10">
        <Link
          role="button"
          className={clsxTwMerge(
            'break-all font-space text-xs text-primary-30 xs:text-sm',
            className
          )}
          to={Routes.NETWORK.ADDRESS(value)}
        >
          {getDisplayValue()}
        </Link>
        {copy && <CopyTextButton text={value} />}
      </div>
    )
  }, [className, value, copy, label, ellipsis])

  return showTooltip ? <Tooltip content={value}>{addressLink}</Tooltip> : addressLink
}
