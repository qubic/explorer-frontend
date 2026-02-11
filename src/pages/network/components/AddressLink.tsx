import { SmartContractIcon } from '@app/assets/icons'
import { Tooltip } from '@app/components/ui'
import { CopyTextButton, COPY_BUTTON_TYPES } from '@app/components/ui/buttons'
import { useGetAddressName } from '@app/hooks'
import { Routes } from '@app/router'
import { clsxTwMerge, formatEllipsis } from '@app/utils'
import { useTranslation } from 'react-i18next'
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
      state={{ skipValidation: true }}
    >
      {displayValue}
    </Link>
  )
}

type AddressLinkProps = LinkElementProps & {
  copy?: boolean
  showTooltip?: boolean
  showContractIcon?: boolean
}

export default function AddressLink({
  value,
  label,
  className,
  copy = false,
  ellipsis = false,
  showTooltip = false,
  showContractIcon = true
}: AddressLinkProps) {
  const { t } = useTranslation('network-page')
  const addressName = useGetAddressName(value)
  const showSmartContractIcon =
    showContractIcon && addressName?.i18nKey === 'smartContract' && Boolean(label)

  const linkElement = (
    <LinkElement value={value} label={label} ellipsis={ellipsis} className={className} />
  )

  return (
    <div className="flex items-center gap-10">
      <div className="flex items-center gap-4">
        {showSmartContractIcon && (
          <Tooltip tooltipId="smart-contract" content={t('smartContract')}>
            <SmartContractIcon className="size-14 text-primary-30" />
          </Tooltip>
        )}
        {showTooltip ? (
          <Tooltip tooltipId="address-link" content={value}>
            {linkElement}
          </Tooltip>
        ) : (
          linkElement
        )}
      </div>
      {copy && <CopyTextButton text={value} type={COPY_BUTTON_TYPES.ADDRESS} />}
    </div>
  )
}
