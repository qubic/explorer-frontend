import { Tooltip } from '@app/components/ui'
import { CopyTextButton, COPY_BUTTON_TYPES } from '@app/components/ui/buttons'
import { formatEllipsis } from '@app/utils'
import AddressLink from './AddressLink'

type Props = {
  address: string | undefined
  highlightAddress?: string
  addressName?: string
  tooltipId: string
  textClassName?: string
  showDash?: boolean
}

export default function AddressCell({
  address,
  highlightAddress,
  addressName,
  tooltipId,
  textClassName = 'font-space text-sm',
  showDash = false
}: Props) {
  if (!address) {
    return showDash ? <span className="font-space text-sm text-gray-50">-</span> : null
  }

  if (highlightAddress === address) {
    return (
      <div className="flex items-center gap-10">
        <Tooltip tooltipId={tooltipId} content={address}>
          <span className={textClassName}>{formatEllipsis(address)}</span>
        </Tooltip>
        <CopyTextButton text={address} type={COPY_BUTTON_TYPES.ADDRESS} />
      </div>
    )
  }

  return <AddressLink value={address} label={addressName} copy showTooltip ellipsis />
}
