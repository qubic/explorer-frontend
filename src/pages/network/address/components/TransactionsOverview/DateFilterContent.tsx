import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DateTimeInput } from '@app/components/ui'
import { clsxTwMerge } from '@app/utils'
import { DATE_PRESETS } from './filterUtils'

type DateRange = {
  start?: string
  end?: string
  presetDays?: number
}

type Props = {
  idPrefix: string
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  onApply: () => void
  onPresetSelect?: (presetDays: number) => void
  selectedPresetDays?: number
  error?: string | null
  showApplyButton?: boolean
}

export default function DateFilterContent({
  idPrefix,
  value,
  onChange,
  onApply,
  onPresetSelect,
  selectedPresetDays,
  error,
  showApplyButton = true
}: Props) {
  const { t } = useTranslation('network-page')
  const [localValue, setLocalValue] = useState<DateRange>(value || {})

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value || {})
  }, [value])

  const handlePresetClick = (preset: (typeof DATE_PRESETS)[0]) => {
    if (onPresetSelect) {
      onPresetSelect(preset.days)
    } else {
      const newValue = {
        start: undefined,
        end: undefined,
        presetDays: preset.days
      }
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  const handleStartChange = (datetime: string | undefined) => {
    const newValue = {
      ...localValue,
      start: datetime,
      presetDays: undefined
    }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleEndChange = (datetime: string | undefined) => {
    const newValue = {
      ...localValue,
      end: datetime,
      presetDays: undefined
    }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const activePresetDays = selectedPresetDays ?? localValue.presetDays

  return (
    <div className="space-y-12">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-6">
        {DATE_PRESETS.map((preset) => {
          const isSelected = activePresetDays === preset.days
          const presetLabel = preset.daysCount
            ? t(preset.labelKey, { count: preset.daysCount })
            : t(preset.labelKey)
          return (
            <button
              key={`${preset.labelKey}-${preset.days}`}
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
        <DateTimeInput
          id={`${idPrefix}-start`}
          label={t('startDate')}
          value={localValue.presetDays !== undefined ? undefined : localValue.start}
          defaultTime="00:00:00"
          onChange={handleStartChange}
        />
        <DateTimeInput
          id={`${idPrefix}-end`}
          label={t('endDate')}
          value={localValue.presetDays !== undefined ? undefined : localValue.end}
          defaultTime="23:59:59"
          onChange={handleEndChange}
        />
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
