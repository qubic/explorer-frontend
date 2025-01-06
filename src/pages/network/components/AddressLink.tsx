import { Tooltip } from '@app/components/ui'
import { CopyTextButton } from '@app/components/ui/buttons'
import { Routes } from '@app/router'
import { clsxTwMerge, formatEllipsis } from '@app/utils'
import { Link } from 'react-router-dom'

type LinkElementProps = {
  value: string
  label?: string
  ellipsis?: boolean
  className?: string
}

function LinkElement({ value, label, ellipsis, className }: LinkElementProps) {
  const displayValue = label || (ellipsis ? formatEllipsis(value) : value)

  return (
    <Link
      className={clsxTwMerge(
        'break-all font-space text-xs text-primary-30 xs:text-sm',
        ellipsis && 'whitespace-nowrap',
        className
      )}
      to={Routes.NETWORK.ADDRESS(value)}
    >
      {displayValue}
    </Link>
  )
}

type AddressLinkProps = LinkElementProps & {
  copy?: boolean
  showTooltip?: boolean
}

export default function AddressLink({
  value,
  label,
  className,
  copy = false,
  ellipsis = false,
  showTooltip = false
}: AddressLinkProps) {
  const linkElement = (
    <LinkElement value={value} label={label} ellipsis={ellipsis} className={className} />
  )

  return (
    <div className="flex items-center gap-10">
      {showTooltip ? <Tooltip content={value}>{linkElement}</Tooltip> : linkElement}
      {copy && <CopyTextButton text={value} />}
    </div>
  )
}
