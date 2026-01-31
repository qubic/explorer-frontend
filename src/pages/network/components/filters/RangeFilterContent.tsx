import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatAmountForDisplay, parseAmountFromDisplay } from '../../utils/filterUtils'

type RangeValue = {
  start?: string
  end?: string
}

type Props = {
  idPrefix: string
  value: RangeValue | undefined
  onChange: (value: RangeValue | undefined) => void
  onApply: () => void
  startLabel: string
  endLabel: string
  error?: string | null
  showApplyButton?: boolean
  layout?: 'vertical' | 'horizontal'
  formatDisplay?: boolean
}

export default function RangeFilterContent({
  idPrefix,
  value,
  onChange,
  onApply,
  startLabel,
  endLabel,
  error,
  showApplyButton = true,
  layout = 'vertical',
  formatDisplay = true
}: Props) {
  const { t } = useTranslation('network-page')
  const [localValue, setLocalValue] = useState<RangeValue>(value || {})

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value || {})
  }, [value])

  const handleStartChange = (rawValue: string) => {
    const newValue = {
      ...localValue,
      start: rawValue || undefined
    }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleEndChange = (rawValue: string) => {
    const newValue = {
      ...localValue,
      end: rawValue || undefined
    }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const displayStart = formatDisplay
    ? formatAmountForDisplay(localValue.start)
    : localValue.start || ''
  const displayEnd = formatDisplay ? formatAmountForDisplay(localValue.end) : localValue.end || ''

  return (
    <div className="space-y-12">
      <div className={layout === 'horizontal' ? 'flex gap-8' : 'space-y-8'}>
        <div className={layout === 'horizontal' ? 'flex-1' : ''}>
          <label htmlFor={`${idPrefix}-start`} className="mb-4 block text-xs text-gray-50">
            {startLabel}
          </label>
          <input
            id={`${idPrefix}-start`}
            type="text"
            inputMode="numeric"
            value={displayStart}
            onChange={(e) => handleStartChange(parseAmountFromDisplay(e.target.value))}
            className="w-full rounded bg-primary-60 px-10 py-6 text-right text-base text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30 md:text-xs"
          />
        </div>
        <div className={layout === 'horizontal' ? 'flex-1' : ''}>
          <label htmlFor={`${idPrefix}-end`} className="mb-4 block text-xs text-gray-50">
            {endLabel}
          </label>
          <input
            id={`${idPrefix}-end`}
            type="text"
            inputMode="numeric"
            value={displayEnd}
            onChange={(e) => handleEndChange(parseAmountFromDisplay(e.target.value))}
            className="w-full rounded bg-primary-60 px-10 py-6 text-right text-base text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30 md:text-xs"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {showApplyButton && (
        <button
          type="button"
          onClick={onApply}
          className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
        >
          {t('filterButton')}
        </button>
      )}
    </div>
  )
}
