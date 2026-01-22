import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { clsxTwMerge } from '@app/utils'
import { AMOUNT_PRESETS, formatAmountForDisplay, parseAmountFromDisplay } from './filterUtils'

type AmountRange = {
  start?: string
  end?: string
  presetKey?: string
}

type Props = {
  idPrefix: string
  value: AmountRange | undefined
  onChange: (value: AmountRange | undefined) => void
  onApply: () => void
  onPresetSelect?: (preset: { start?: string; end?: string; labelKey: string }) => void
  selectedPresetKey?: string
  error?: string | null
  showApplyButton?: boolean
  layout?: 'vertical' | 'horizontal'
}

export default function AmountFilterContent({
  idPrefix,
  value,
  onChange,
  onApply,
  onPresetSelect,
  selectedPresetKey,
  error,
  showApplyButton = true,
  layout = 'vertical'
}: Props) {
  const { t } = useTranslation('network-page')
  const [localValue, setLocalValue] = useState<AmountRange>(value || {})

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value || {})
  }, [value])

  const handlePresetClick = (preset: (typeof AMOUNT_PRESETS)[0]) => {
    if (onPresetSelect) {
      onPresetSelect(preset)
    } else {
      const newValue = {
        start: preset.start,
        end: preset.end,
        presetKey: preset.labelKey
      }
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  const handleStartChange = (rawValue: string) => {
    const newValue = {
      ...localValue,
      start: rawValue || undefined,
      presetKey: undefined
    }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleEndChange = (rawValue: string) => {
    const newValue = {
      ...localValue,
      end: rawValue || undefined,
      presetKey: undefined
    }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const displayStart = localValue.presetKey ? '' : formatAmountForDisplay(localValue.start)
  const displayEnd = localValue.presetKey ? '' : formatAmountForDisplay(localValue.end)
  const activePresetKey = selectedPresetKey || localValue.presetKey

  return (
    <div className="space-y-12">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-6">
        {AMOUNT_PRESETS.map((preset) => {
          const isSelected = activePresetKey === preset.labelKey
          const presetLabel = t(preset.labelKey)
          return (
            <button
              key={preset.labelKey}
              type="button"
              aria-label={presetLabel}
              onClick={() => handlePresetClick(preset)}
              className={clsxTwMerge(
                'rounded-full border px-8 py-4 text-xs transition-colors',
                isSelected
                  ? 'border-primary-30 bg-primary-60 text-primary-30'
                  : 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
              )}
            >
              {presetLabel}
            </button>
          )
        })}
      </div>

      <div className="border-t border-primary-60" />

      {/* Range inputs */}
      <div className="space-y-8">
        <p className="text-xs font-medium text-gray-50">{t('customRange')}</p>
        <div className={layout === 'horizontal' ? 'flex gap-8' : 'space-y-8'}>
          <div className={layout === 'horizontal' ? 'flex-1' : ''}>
            <label htmlFor={`${idPrefix}-amount-min`} className="mb-4 block text-xs text-gray-50">
              {t('minAmount')}
            </label>
            <input
              id={`${idPrefix}-amount-min`}
              type="text"
              inputMode="numeric"
              value={displayStart}
              onChange={(e) => handleStartChange(parseAmountFromDisplay(e.target.value))}
              className="w-full rounded bg-primary-60 px-10 py-6 text-right text-base text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30 md:text-xs"
            />
          </div>
          <div className={layout === 'horizontal' ? 'flex-1' : ''}>
            <label htmlFor={`${idPrefix}-amount-max`} className="mb-4 block text-xs text-gray-50">
              {t('maxAmount')}
            </label>
            <input
              id={`${idPrefix}-amount-max`}
              type="text"
              inputMode="numeric"
              value={displayEnd}
              onChange={(e) => handleEndChange(parseAmountFromDisplay(e.target.value))}
              className="w-full rounded bg-primary-60 px-10 py-6 text-right text-base text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30 md:text-xs"
            />
          </div>
        </div>
        <p className="text-xs italic text-gray-50">*{t('amountFilterHint')}</p>
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
    </div>
  )
}
