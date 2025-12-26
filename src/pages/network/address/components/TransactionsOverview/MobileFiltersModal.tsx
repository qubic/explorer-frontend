import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArrowDownIcon, ArrowUpIcon, XmarkIcon } from '@app/assets/icons'
import { DateTimeInput, Modal } from '@app/components/ui'
import { clsxTwMerge } from '@app/utils'
import type { TransactionDirection, TransactionFilters } from '../../hooks/useLatestTransactions'
import {
  AMOUNT_PRESETS,
  DATE_PRESETS,
  DIRECTION_OPTIONS,
  formatAmountForDisplay,
  getStartDateFromDays,
  parseAmountFromDisplay
} from './filterUtils'

type Props = {
  isOpen: boolean
  onClose: () => void
  activeFilters: TransactionFilters
  onApplyFilters: (filters: TransactionFilters) => void
}

export default function MobileFiltersModal({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters
}: Props) {
  const { t } = useTranslation('network-page')
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(activeFilters)
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({})

  // Sync local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(activeFilters)
      setValidationErrors({})
    }
  }, [isOpen, activeFilters])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleDirectionChange = useCallback((direction: TransactionDirection | undefined) => {
    setLocalFilters((prev) => ({ ...prev, direction }))
  }, [])

  const handleApplyAllFilters = useCallback(() => {
    // Validate before applying
    let hasError = false

    // Validate amount range
    if (localFilters.amountRange?.start && localFilters.amountRange?.end) {
      const startNum = Number(localFilters.amountRange.start)
      const endNum = Number(localFilters.amountRange.end)
      if (startNum > endNum) {
        setValidationErrors((prev) => ({ ...prev, amount: t('invalidRangeAmount') }))
        hasError = true
      }
    }

    // Validate date range
    if (localFilters.dateRange?.start && localFilters.dateRange?.end) {
      const startDate = new Date(localFilters.dateRange.start)
      const endDate = new Date(localFilters.dateRange.end)
      if (startDate > endDate) {
        setValidationErrors((prev) => ({ ...prev, date: t('invalidDateRange') }))
        hasError = true
      }
    }

    // Validate inputType range
    if (localFilters.inputTypeRange?.start && localFilters.inputTypeRange?.end) {
      const startNum = Number(localFilters.inputTypeRange.start)
      const endNum = Number(localFilters.inputTypeRange.end)
      if (startNum > endNum) {
        setValidationErrors((prev) => ({ ...prev, inputType: t('invalidRangeInputType') }))
        hasError = true
      }
    }

    // Validate tick range (start must be less than end, not equal)
    if (localFilters.tickNumberRange?.start && localFilters.tickNumberRange?.end) {
      const startNum = Number(localFilters.tickNumberRange.start)
      const endNum = Number(localFilters.tickNumberRange.end)
      if (startNum >= endNum) {
        setValidationErrors((prev) => ({ ...prev, tick: t('invalidTickRange') }))
        hasError = true
        // Scroll to tick filter error
        setTimeout(() => {
          document.getElementById('mobile-tick-filter')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }

    if (hasError) return

    // Calculate date from presetDays at apply time (like desktop behavior)
    let filtersToApply = localFilters
    if (localFilters.dateRange?.presetDays !== undefined && !localFilters.dateRange?.start) {
      const startDate = getStartDateFromDays(localFilters.dateRange.presetDays)
      filtersToApply = {
        ...localFilters,
        dateRange: {
          start: startDate,
          end: undefined,
          presetDays: localFilters.dateRange.presetDays
        }
      }
    }

    onApplyFilters(filtersToApply)
    onClose()
    setValidationErrors({})
  }, [localFilters, onApplyFilters, onClose, t])

  // Direction segmented control
  const renderDirectionSegmentedControl = () => (
    <div className="inline-flex rounded border border-primary-60">
      {DIRECTION_OPTIONS.map((option, index) => {
        const isSelected = localFilters.direction === option.value
        const isFirst = index === 0
        const isLast = index === DIRECTION_OPTIONS.length - 1

        return (
          <button
            key={option.labelKey}
            type="button"
            onClick={() => handleDirectionChange(option.value)}
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
      })}
    </div>
  )

  return (
    <Modal
      id="mobile-filters-modal"
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setValidationErrors({})
      }}
      closeOnOutsideClick
      className="top-0 h-full sm:hidden"
    >
      <div className="flex h-full flex-col bg-primary-70">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-primary-60 px-16 py-14">
          <h2 className="text-base font-medium text-white">{t('filters')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-60 hover:bg-primary-50"
            aria-label="Close filters"
          >
            <XmarkIcon className="h-16 w-16 text-white" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-16">
          <div className="space-y-20">
            {/* Direction */}
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('direction')}</h3>
              {renderDirectionSegmentedControl()}
            </div>

            {/* Source */}
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('source')}</h3>
              <input
                id="filter-source"
                type="text"
                value={localFilters.source || ''}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, source: e.target.value }))}
                placeholder={t('addressPlaceholder')}
                className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
              />
            </div>

            {/* Destination */}
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('destination')}*</h3>
              <input
                id="filter-destination"
                type="text"
                value={localFilters.destination || ''}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, destination: e.target.value }))
                }
                placeholder={t('addressPlaceholder')}
                className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
              />
              <p className="mt-6 text-xs italic text-gray-50">*{t('destinationFilterHint')}</p>
            </div>

            {/* Amount */}
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('amount')}</h3>
              <div className="space-y-12">
                {/* Preset chips */}
                <div className="flex flex-wrap gap-6">
                  {AMOUNT_PRESETS.map((preset) => {
                    const isSelected = localFilters.amountRange?.presetKey === preset.labelKey
                    const presetLabel = t(preset.labelKey)
                    return (
                      <button
                        key={preset.labelKey}
                        type="button"
                        aria-label={presetLabel}
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            amountRange: {
                              start: preset.start,
                              end: preset.end,
                              presetKey: preset.labelKey
                            }
                          }))
                        }
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
                {/* Range inputs */}
                <div className="space-y-8">
                  <div className="flex gap-8">
                    <div className="flex-1">
                      <label
                        htmlFor="filter-amount-min"
                        className="mb-4 block text-xs text-gray-50"
                      >
                        {t('minAmount')}
                      </label>
                      <input
                        id="filter-amount-min"
                        type="text"
                        inputMode="numeric"
                        value={
                          localFilters.amountRange?.presetKey
                            ? ''
                            : formatAmountForDisplay(localFilters.amountRange?.start)
                        }
                        onChange={(e) => {
                          const rawValue = parseAmountFromDisplay(e.target.value)
                          setLocalFilters((prev) => ({
                            ...prev,
                            amountRange: {
                              ...prev.amountRange,
                              start: rawValue || undefined,
                              presetKey: undefined
                            }
                          }))
                        }}
                        className="w-full rounded bg-primary-60 px-10 py-6 text-right text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="filter-amount-max"
                        className="mb-4 block text-xs text-gray-50"
                      >
                        {t('maxAmount')}
                      </label>
                      <input
                        id="filter-amount-max"
                        type="text"
                        inputMode="numeric"
                        value={
                          localFilters.amountRange?.presetKey
                            ? ''
                            : formatAmountForDisplay(localFilters.amountRange?.end)
                        }
                        onChange={(e) => {
                          const rawValue = parseAmountFromDisplay(e.target.value)
                          setLocalFilters((prev) => ({
                            ...prev,
                            amountRange: {
                              ...prev.amountRange,
                              end: rawValue || undefined,
                              presetKey: undefined
                            }
                          }))
                        }}
                        className="w-full rounded bg-primary-60 px-10 py-6 text-right text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
                      />
                    </div>
                  </div>
                  {validationErrors.amount && (
                    <p className="text-xs text-red-400">{validationErrors.amount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('date')}</h3>
              <div className="space-y-12">
                {/* Preset chips */}
                <div className="flex flex-wrap gap-6">
                  {DATE_PRESETS.map((preset) => {
                    const isSelected = localFilters.dateRange?.presetDays === preset.days
                    return (
                      <button
                        key={`${preset.labelKey}-${preset.days}`}
                        type="button"
                        aria-label={
                          preset.daysCount
                            ? t(preset.labelKey, { count: preset.daysCount })
                            : t(preset.labelKey)
                        }
                        onClick={() => {
                          setLocalFilters((prev) => ({
                            ...prev,
                            dateRange: { start: undefined, end: undefined, presetDays: preset.days }
                          }))
                        }}
                        className={clsxTwMerge(
                          'rounded-full border px-8 py-4 text-xs transition-colors',
                          isSelected
                            ? 'border-primary-30 bg-primary-60 text-primary-30'
                            : 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
                        )}
                      >
                        {preset.daysCount
                          ? t(preset.labelKey, { count: preset.daysCount })
                          : t(preset.labelKey)}
                      </button>
                    )
                  })}
                </div>
                {/* Range inputs */}
                <div className="space-y-8">
                  <DateTimeInput
                    id="filter-date-start"
                    label={t('startDate')}
                    value={localFilters.dateRange?.start}
                    defaultTime="00:00:00"
                    onChange={(datetime) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: datetime, presetDays: undefined }
                      }))
                    }
                  />
                  <DateTimeInput
                    id="filter-date-end"
                    label={t('endDate')}
                    value={localFilters.dateRange?.end}
                    defaultTime="23:59:59"
                    onChange={(datetime) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: datetime, presetDays: undefined }
                      }))
                    }
                  />
                  {validationErrors.date && (
                    <p className="text-xs text-red-400">{validationErrors.date}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Input Type */}
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('inputType')}</h3>
              <div className="space-y-8">
                <div className="flex gap-8">
                  <div className="flex-1">
                    <label
                      htmlFor="filter-inputtype-start"
                      className="mb-4 block text-xs text-gray-50"
                    >
                      {t('minInputType')}
                    </label>
                    <input
                      id="filter-inputtype-start"
                      type="text"
                      inputMode="numeric"
                      value={localFilters.inputTypeRange?.start || ''}
                      onChange={(e) => {
                        const rawValue = parseAmountFromDisplay(e.target.value)
                        setLocalFilters((prev) => ({
                          ...prev,
                          inputTypeRange: { ...prev.inputTypeRange, start: rawValue || undefined }
                        }))
                      }}
                      className="w-full rounded bg-primary-60 px-10 py-6 text-right text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="filter-inputtype-end"
                      className="mb-4 block text-xs text-gray-50"
                    >
                      {t('maxInputType')}
                    </label>
                    <input
                      id="filter-inputtype-end"
                      type="text"
                      inputMode="numeric"
                      value={localFilters.inputTypeRange?.end || ''}
                      onChange={(e) => {
                        const rawValue = parseAmountFromDisplay(e.target.value)
                        setLocalFilters((prev) => ({
                          ...prev,
                          inputTypeRange: { ...prev.inputTypeRange, end: rawValue || undefined }
                        }))
                      }}
                      className="w-full rounded bg-primary-60 px-10 py-6 text-right text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
                    />
                  </div>
                </div>
                {validationErrors.inputType && (
                  <p className="text-xs text-red-400">{validationErrors.inputType}</p>
                )}
              </div>
            </div>

            {/* Tick */}
            <div id="mobile-tick-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('tick')}</h3>
              <div className="space-y-8">
                <div className="flex gap-8">
                  <div className="flex-1">
                    <label htmlFor="filter-tick-start" className="mb-4 block text-xs text-gray-50">
                      {t('startTick')}
                    </label>
                    <input
                      id="filter-tick-start"
                      type="text"
                      inputMode="numeric"
                      value={formatAmountForDisplay(localFilters.tickNumberRange?.start)}
                      onChange={(e) => {
                        const rawValue = parseAmountFromDisplay(e.target.value)
                        setLocalFilters((prev) => ({
                          ...prev,
                          tickNumberRange: { ...prev.tickNumberRange, start: rawValue || undefined }
                        }))
                      }}
                      className="w-full rounded bg-primary-60 px-10 py-6 text-right text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="filter-tick-end" className="mb-4 block text-xs text-gray-50">
                      {t('endTick')}
                    </label>
                    <input
                      id="filter-tick-end"
                      type="text"
                      inputMode="numeric"
                      value={formatAmountForDisplay(localFilters.tickNumberRange?.end)}
                      onChange={(e) => {
                        const rawValue = parseAmountFromDisplay(e.target.value)
                        setLocalFilters((prev) => ({
                          ...prev,
                          tickNumberRange: { ...prev.tickNumberRange, end: rawValue || undefined }
                        }))
                      }}
                      className="w-full rounded bg-primary-60 px-10 py-6 text-right text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
                    />
                  </div>
                </div>
                {validationErrors.tick && (
                  <p className="text-xs text-red-400">{validationErrors.tick}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Apply button (sticky footer) */}
        <div className="shrink-0 border-t border-primary-60 px-16 py-12">
          <button
            type="button"
            onClick={handleApplyAllFilters}
            className="w-full rounded bg-primary-30 px-16 py-10 text-sm font-medium text-primary-80 hover:bg-primary-40"
          >
            {t('applyFilters')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
