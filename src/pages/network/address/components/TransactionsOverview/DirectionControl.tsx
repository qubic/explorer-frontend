import { useTranslation } from 'react-i18next'

import { ArrowDownIcon, ArrowUpIcon } from '@app/assets/icons'
import Tooltip from '@app/components/ui/Tooltip'
import { clsxTwMerge } from '@app/utils'
import type { TransactionDirection } from '../../hooks/useLatestTransactions'
import { DIRECTION_OPTIONS } from './filterUtils'

type Props = {
  value: TransactionDirection | undefined
  onChange: (direction: TransactionDirection | undefined) => void
  showTooltips?: boolean
}

export default function DirectionControl({ value, onChange, showTooltips = false }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <div className="inline-flex rounded border border-primary-60">
      {DIRECTION_OPTIONS.map((option, index) => {
        const isSelected = value === option.value
        const isFirst = index === 0
        const isLast = index === DIRECTION_OPTIONS.length - 1

        const buttonContent = (
          <button
            key={option.labelKey}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsxTwMerge(
              'flex w-40 items-center justify-center gap-4 py-5 font-space text-xs font-medium transition duration-300',
              isFirst && 'rounded-l',
              isLast && 'rounded-r',
              !isFirst && 'border-l border-primary-60',
              isSelected ? 'bg-primary-30 text-primary-80' : 'text-gray-100 hover:bg-primary-60/60'
            )}
          >
            {option.value === 'incoming' && (
              <ArrowDownIcon
                className={clsxTwMerge(
                  'size-14',
                  isSelected ? 'text-primary-80' : 'text-success-30'
                )}
              />
            )}
            {option.value === 'outgoing' && (
              <ArrowUpIcon
                className={clsxTwMerge('size-14', isSelected ? 'text-primary-80' : 'text-error-30')}
              />
            )}
            {option.value === undefined && <span>{t(option.labelKey)}</span>}
          </button>
        )

        if (showTooltips && option.value === 'incoming') {
          return (
            <Tooltip
              key={option.labelKey}
              tooltipId="direction-incoming"
              content={t('directionIncomingTooltip')}
            >
              {buttonContent}
            </Tooltip>
          )
        }
        if (showTooltips && option.value === 'outgoing') {
          return (
            <Tooltip
              key={option.labelKey}
              tooltipId="direction-outgoing"
              content={t('directionOutgoingTooltip')}
            >
              {buttonContent}
            </Tooltip>
          )
        }

        return buttonContent
      })}
    </div>
  )
}
