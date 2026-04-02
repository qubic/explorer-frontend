import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ASSET_TYPE_OPTIONS,
  type AmountAssetType,
  type EventAmountFilter
} from '../../utils/eventFilterUtils'
import { formatAmountForDisplay, parseNumericInput } from '../../utils/filterUtils'

const ASSET_TYPE_LABEL_KEYS: Record<AmountAssetType, string> = {
  any: 'amountAssetAny',
  qubic: 'amountAssetQubic',
  other: 'amountAssetOther'
}

const DEFAULT_VALUE: EventAmountFilter = { assetType: 'any' }

type Props = {
  idPrefix: string
  value: EventAmountFilter | undefined
  onChange: (value: EventAmountFilter | undefined) => void
  onApply: () => void
  error?: string | null
  showApplyButton?: boolean
  layout?: 'vertical' | 'horizontal'
}

export default function EventAmountFilterContent({
  idPrefix,
  value,
  onChange,
  onApply,
  error,
  showApplyButton = true,
  layout = 'vertical'
}: Props) {
  const { t } = useTranslation('network-page')
  const current = value || DEFAULT_VALUE

  const handleChange = useCallback(
    (updates: Partial<EventAmountFilter>) => {
      onChange({ ...current, ...updates })
    },
    [onChange, current]
  )

  return (
    <div className="space-y-12">
      {/* Asset type selector */}
      <div>
        <label
          htmlFor={`${idPrefix}-asset-type`}
          className="mb-4 block text-xs font-medium text-gray-50"
        >
          {t('amountAssetType')}
        </label>
        <select
          id={`${idPrefix}-asset-type`}
          value={current.assetType}
          onChange={(e) => handleChange({ assetType: e.target.value as AmountAssetType })}
          className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-30"
        >
          {ASSET_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(ASSET_TYPE_LABEL_KEYS[option])}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-primary-60" />

      {/* Range inputs */}
      <div className="space-y-8">
        <div className={layout === 'horizontal' ? 'flex gap-8' : 'space-y-8'}>
          <div className={layout === 'horizontal' ? 'flex-1' : ''}>
            <label htmlFor={`${idPrefix}-amount-min`} className="mb-4 block text-xs text-gray-50">
              {t('minAmount')}
            </label>
            <input
              id={`${idPrefix}-amount-min`}
              type="text"
              inputMode="numeric"
              value={formatAmountForDisplay(current.min)}
              onChange={(e) =>
                handleChange({ min: parseNumericInput(e.target.value) || undefined })
              }
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
              value={formatAmountForDisplay(current.max)}
              onChange={(e) =>
                handleChange({ max: parseNumericInput(e.target.value) || undefined })
              }
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
    </div>
  )
}
