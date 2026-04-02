import { useTranslation } from 'react-i18next'

import {
  EVENT_TYPE_FILTER_OPTIONS,
  MAX_EVENT_TYPE_SELECTIONS,
  getEventTypeLabel
} from '@app/store/apis/events'
import { clsxTwMerge } from '@app/utils'

type Props = {
  selectedTypes: number[]
  onToggle: (type: number) => void
  className?: string
}

function getChipClassName(isSelected: boolean, isDisabled: boolean): string {
  if (isSelected) return 'border-primary-30 bg-primary-60 text-primary-30'
  if (isDisabled) return 'cursor-not-allowed border-primary-60/50 text-gray-60'
  return 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
}

export default function EventTypeChips({ selectedTypes, onToggle, className }: Props) {
  const { t } = useTranslation('network-page')
  const isAtMax = selectedTypes.length >= MAX_EVENT_TYPE_SELECTIONS

  return (
    <div className={clsxTwMerge('flex flex-col gap-8', className)}>
      <p className="mb-4 text-xs text-gray-50">
        {t('selectUpTo', { count: MAX_EVENT_TYPE_SELECTIONS })}
      </p>
      <div className="flex flex-wrap gap-8">
        {EVENT_TYPE_FILTER_OPTIONS.map((type) => {
          const isSelected = selectedTypes.includes(type)
          const isDisabled = !isSelected && isAtMax

          return (
            <button
              key={type}
              type="button"
              disabled={isDisabled}
              className={`rounded-full border px-8 py-4 text-xs transition-colors ${getChipClassName(isSelected, isDisabled)}`}
              onClick={() => onToggle(type)}
            >
              {getEventTypeLabel(type)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
