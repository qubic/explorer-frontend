import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArrowDownIcon, ArrowUpIcon, FunnelIcon, UndoIcon } from '@app/assets/icons'
import { DateTimeInput } from '@app/components/ui'
import Tooltip from '@app/components/ui/Tooltip'
import { clsxTwMerge } from '@app/utils'
import type { TransactionDirection, TransactionFilters } from '../../hooks/useLatestTransactions'
import ActiveFilterChip from './ActiveFilterChip'
import FilterDropdown from './FilterDropdown'
import MobileFiltersModal from './MobileFiltersModal'
import {
  AMOUNT_PRESETS,
  DATE_PRESETS,
  DIRECTION_OPTIONS,
  formatAmountForDisplay,
  formatAmountShort,
  getStartDateFromDays,
  parseAmountFromDisplay
} from './filterUtils'

type Props = {
  addressId: string
  activeFilters: TransactionFilters
  onApplyFilters: (filters: TransactionFilters) => void
  onClearFilters: () => void
}

export default function TransactionFiltersBar({
  addressId,
  activeFilters,
  onApplyFilters,
  onClearFilters
}: Props) {
  const { t } = useTranslation('network-page')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)

  const [localFilters, setLocalFilters] = useState<TransactionFilters>(activeFilters)
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({})

  const handleToggle = useCallback(
    (dropdown: string) => {
      setOpenDropdown((prev) => {
        if (prev === dropdown) {
          // Closing dropdown - clear its validation error and reset local filters
          setValidationErrors((errors) => ({ ...errors, [dropdown]: null }))
          setLocalFilters((current) => ({
            ...current,
            amountRange: undefined,
            dateRange: undefined
          }))
          return null
        }
        // Opening dropdown - sync local filters with active filters
        const isAmountPreset = !!activeFilters.amountRange?.presetKey
        const isDatePreset = activeFilters.dateRange?.presetDays !== undefined
        setLocalFilters({
          ...activeFilters,
          amountRange: isAmountPreset ? undefined : activeFilters.amountRange,
          dateRange: isDatePreset ? undefined : activeFilters.dateRange
        })
        return dropdown
      })
    },
    [activeFilters]
  )

  const handleApplyRangeFilter = useCallback(
    (
      filterKey: 'amountRange' | 'tickNumberRange' | 'dateRange' | 'inputTypeRange',
      start: string | undefined,
      end: string | undefined
    ) => {
      const filterConfig: Record<
        typeof filterKey,
        { dropdownKey: string; errorKey: string; strictComparison?: boolean }
      > = {
        amountRange: { dropdownKey: 'amount', errorKey: 'invalidRangeAmount' },
        tickNumberRange: {
          dropdownKey: 'tick',
          errorKey: 'invalidTickRange',
          strictComparison: true
        },
        dateRange: { dropdownKey: 'date', errorKey: 'invalidDateRange' },
        inputTypeRange: { dropdownKey: 'inputType', errorKey: 'invalidRangeInputType' }
      }

      const { dropdownKey, errorKey, strictComparison } = filterConfig[filterKey]

      let error: string | null = null
      if (start && end) {
        if (filterKey === 'dateRange') {
          const startDate = new Date(start)
          const endDate = new Date(end)
          if (startDate > endDate) {
            error = t(errorKey)
          }
        } else {
          const startNum = Number(start)
          const endNum = Number(end)
          const isInvalid = strictComparison ? startNum >= endNum : startNum > endNum
          if (isInvalid) {
            error = t(errorKey)
          }
        }
      }

      if (error) {
        setValidationErrors((prev) => ({ ...prev, [dropdownKey]: error }))
        return
      }

      setValidationErrors((prev) => ({ ...prev, [dropdownKey]: null }))

      const newFilters = {
        ...activeFilters,
        [filterKey]: start || end ? { start, end } : undefined
      }
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown(null)
    },
    [activeFilters, onApplyFilters, t]
  )

  const handleApplyDatePreset = useCallback(
    (presetDays: number) => {
      const startDate = getStartDateFromDays(presetDays)
      const newFilters = {
        ...activeFilters,
        dateRange: { start: startDate, end: undefined, presetDays }
      }
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown(null)
    },
    [activeFilters, onApplyFilters]
  )

  const handleApplyAmountPreset = useCallback(
    (preset: { labelKey: string; start: string; end: string | undefined }) => {
      const newFilters = {
        ...activeFilters,
        amountRange: { start: preset.start, end: preset.end, presetKey: preset.labelKey }
      }
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown(null)
    },
    [activeFilters, onApplyFilters]
  )

  const handleDirectionChange = useCallback(
    (direction: TransactionDirection | undefined) => {
      const newFilters = { ...activeFilters, direction }

      if (direction === 'incoming') {
        newFilters.destination = addressId
        if (newFilters.source === addressId) {
          newFilters.source = undefined
        }
      } else if (direction === 'outgoing') {
        newFilters.source = addressId
        if (newFilters.destination === addressId) {
          newFilters.destination = undefined
        }
      } else {
        if (newFilters.source === addressId) {
          newFilters.source = undefined
        }
        if (newFilters.destination === addressId) {
          newFilters.destination = undefined
        }
      }

      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
    },
    [activeFilters, onApplyFilters, addressId]
  )

  // Check for active filters (excluding direction)
  const hasActiveFilters = Object.entries(activeFilters).some(([key, value]) => {
    if (key === 'direction') return false
    if (['tickNumberRange', 'dateRange', 'amountRange', 'inputTypeRange'].includes(key)) {
      return value && (value.start || value.end)
    }
    return key !== 'amount' && typeof value === 'string' && value.trim() !== ''
  })

  const isSourceActive = !!activeFilters.source
  const isDestinationActive = !!activeFilters.destination
  const isAmountActive = !!(activeFilters.amountRange?.start || activeFilters.amountRange?.end)
  const isDateActive = !!(activeFilters.dateRange?.start || activeFilters.dateRange?.end)
  const isTickActive = !!(
    activeFilters.tickNumberRange?.start || activeFilters.tickNumberRange?.end
  )
  const isInputTypeActive = !!(
    activeFilters.inputTypeRange?.start || activeFilters.inputTypeRange?.end
  )

  // Format address with first 4 and last 4 characters
  const formatAddressShort = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`

  // Get display labels for active filters
  const getSourceLabel = () => {
    if (!isSourceActive || !activeFilters.source) return t('source')
    return `${t('source')}: ${formatAddressShort(activeFilters.source)}`
  }

  const getDestinationLabel = () => {
    if (!isDestinationActive || !activeFilters.destination) return t('destination')
    return `${t('destination')}: ${formatAddressShort(activeFilters.destination)}`
  }

  const getAmountLabel = () => {
    if (!isAmountActive) return t('amount')
    const { start, end, presetKey } = activeFilters.amountRange || {}

    if (presetKey) {
      const preset = AMOUNT_PRESETS.find((p) => p.labelKey === presetKey)
      if (preset) return `${t('amount')}: ${t(preset.labelKey)}`
    }

    if (start && end)
      return `${t('amount')}: ${formatAmountShort(start, t)} - ${formatAmountShort(end, t)}`
    if (start) return `${t('amount')}: >= ${formatAmountShort(start, t)}`
    if (end) return `${t('amount')}: <= ${formatAmountShort(end, t)}`
    return t('amount')
  }

  const getDateLabel = () => {
    if (!isDateActive) return t('date')
    const { start, end, presetDays } = activeFilters.dateRange || {}

    if (presetDays !== undefined) {
      const preset = DATE_PRESETS.find((p) => p.days === presetDays)
      if (preset) {
        const presetLabel = preset.daysCount
          ? t(preset.labelKey, { count: preset.daysCount })
          : t(preset.labelKey)
        return `${t('date')}: ${presetLabel}`
      }
    }

    const formatDateTimeShort = (dateStr: string) => {
      const date = new Date(dateStr)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const year = String(date.getFullYear()).slice(-2)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${month}/${day}/${year} ${hours}:${minutes}`
    }

    if (start && end)
      return `${t('date')}: ${formatDateTimeShort(start)} - ${formatDateTimeShort(end)}`
    if (start) return `${t('date')}: >= ${formatDateTimeShort(start)}`
    if (end) return `${t('date')}: <= ${formatDateTimeShort(end)}`
    return t('date')
  }

  const getTickLabel = () => {
    if (!isTickActive) return t('tick')
    const { start, end } = activeFilters.tickNumberRange || {}
    if (start && end)
      return `${t('tick')}: ${formatAmountForDisplay(start)} - ${formatAmountForDisplay(end)}`
    if (start) return `${t('tick')}: >= ${formatAmountForDisplay(start)}`
    if (end) return `${t('tick')}: <= ${formatAmountForDisplay(end)}`
    return t('tick')
  }

  const getInputTypeLabel = () => {
    if (!isInputTypeActive) return t('inputType')
    const { start, end } = activeFilters.inputTypeRange || {}
    if (start && end) return `${t('inputType')}: ${start} - ${end}`
    if (start) return `${t('inputType')}: >= ${start}`
    if (end) return `${t('inputType')}: <= ${end}`
    return t('inputType')
  }

  // Clear handlers for individual filters
  const clearSourceFilter = useCallback(() => {
    const newFilters = { ...activeFilters, source: undefined }
    if (activeFilters.source === addressId) {
      newFilters.direction = undefined
    }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters, addressId])

  const clearDestinationFilter = useCallback(() => {
    const newFilters = { ...activeFilters, destination: undefined }
    if (activeFilters.destination === addressId) {
      newFilters.direction = undefined
    }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters, addressId])

  const clearAmountFilter = useCallback(() => {
    const newFilters = { ...activeFilters, amountRange: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  const clearDateFilter = useCallback(() => {
    const newFilters = { ...activeFilters, dateRange: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  const clearTickFilter = useCallback(() => {
    const newFilters = { ...activeFilters, tickNumberRange: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  const clearInputTypeFilter = useCallback(() => {
    const newFilters = { ...activeFilters, inputTypeRange: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  // Segmented control for direction filter
  const renderDirectionSegmentedControl = (showTooltips: boolean) => (
    <div className="inline-flex rounded border border-primary-60">
      {DIRECTION_OPTIONS.map((option, index) => {
        const isSelected = activeFilters.direction === option.value
        const isFirst = index === 0
        const isLast = index === DIRECTION_OPTIONS.length - 1

        const buttonContent = (
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

  return (
    <>
      {/* Mobile: Filters button on top, active filter chips below */}
      <div className="mb-16 flex flex-col gap-10 sm:hidden">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className="flex shrink-0 items-center gap-6 rounded border border-primary-60 px-10 py-5 font-space text-xs font-medium text-gray-100 transition duration-300 hover:bg-primary-60/60"
          >
            <FunnelIcon className="h-14 w-14" />
            <span>{t('filters')}</span>
          </button>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-6">
            {isSourceActive && (
              <ActiveFilterChip label={getSourceLabel()} onClear={clearSourceFilter} />
            )}
            {isDestinationActive && (
              <ActiveFilterChip label={getDestinationLabel()} onClear={clearDestinationFilter} />
            )}
            {isAmountActive && (
              <ActiveFilterChip label={getAmountLabel()} onClear={clearAmountFilter} />
            )}
            {isDateActive && <ActiveFilterChip label={getDateLabel()} onClear={clearDateFilter} />}
            {isTickActive && <ActiveFilterChip label={getTickLabel()} onClear={clearTickFilter} />}
            {isInputTypeActive && (
              <ActiveFilterChip label={getInputTypeLabel()} onClear={clearInputTypeFilter} />
            )}

            <button
              type="button"
              onClick={() => {
                onClearFilters()
                setLocalFilters({})
              }}
              className="ml-auto flex shrink-0 items-center gap-4 text-xs text-gray-50 transition-colors hover:text-white"
            >
              <UndoIcon className="h-14 w-14" />
              <span>{t('resetFilters')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      <MobileFiltersModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        activeFilters={activeFilters}
        onApplyFilters={onApplyFilters}
      />

      {/* Desktop: Original dropdown filters */}
      <div className="mb-16 hidden w-full flex-wrap items-center gap-8 sm:flex">
        <FunnelIcon className="h-16 w-16 text-gray-50" />

        {renderDirectionSegmentedControl(true)}

        {/* Source Filter */}
        <FilterDropdown
          label={getSourceLabel()}
          isActive={isSourceActive}
          show={openDropdown === 'source'}
          onToggle={() => handleToggle('source')}
          onClear={isSourceActive ? clearSourceFilter : undefined}
          contentClassName="min-w-[300px]"
        >
          <div className="space-y-12">
            <input
              id="filter-source-desktop-standalone"
              type="text"
              value={localFilters.source || ''}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, source: e.target.value }))}
              placeholder={t('addressPlaceholder')}
              className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
            />
            <button
              type="button"
              onClick={() => {
                const newFilters = { ...activeFilters, source: localFilters.source || undefined }
                onApplyFilters(newFilters)
                setLocalFilters(newFilters)
                setOpenDropdown(null)
              }}
              className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
            >
              {t('filterButton')}
            </button>
          </div>
        </FilterDropdown>

        {/* Destination Filter */}
        <FilterDropdown
          label={getDestinationLabel()}
          isActive={isDestinationActive}
          show={openDropdown === 'destination'}
          onToggle={() => handleToggle('destination')}
          onClear={isDestinationActive ? clearDestinationFilter : undefined}
          contentClassName="min-w-[300px]"
        >
          <div className="space-y-12">
            <input
              id="filter-destination-desktop-standalone"
              type="text"
              value={localFilters.destination || ''}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, destination: e.target.value }))
              }
              placeholder={t('addressPlaceholder')}
              className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
            />
            <p className="text-xs italic text-gray-50">*{t('destinationFilterHint')}</p>
            <button
              type="button"
              onClick={() => {
                const newFilters = {
                  ...activeFilters,
                  destination: localFilters.destination || undefined
                }
                onApplyFilters(newFilters)
                setLocalFilters(newFilters)
                setOpenDropdown(null)
              }}
              className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
            >
              {t('filterButton')}
            </button>
          </div>
        </FilterDropdown>

        {/* Amount Filter */}
        <FilterDropdown
          label={getAmountLabel()}
          isActive={isAmountActive}
          show={openDropdown === 'amount'}
          onToggle={() => handleToggle('amount')}
          onClear={isAmountActive ? clearAmountFilter : undefined}
          contentClassName="min-w-[200px]"
        >
          <div className="space-y-12">
            <div className="flex flex-wrap gap-6">
              {AMOUNT_PRESETS.map((preset) => {
                const isSelected = activeFilters.amountRange?.presetKey === preset.labelKey
                const presetLabel = t(preset.labelKey)
                return (
                  <button
                    key={preset.labelKey}
                    type="button"
                    aria-label={presetLabel}
                    onClick={() => handleApplyAmountPreset(preset)}
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
            <div className="space-y-8">
              <p className="text-xs font-medium text-gray-50">{t('customRange')}</p>
              <div>
                <label
                  htmlFor="filter-amount-min-desktop"
                  className="mb-4 block text-xs text-gray-50"
                >
                  {t('minAmount')}
                </label>
                <input
                  id="filter-amount-min-desktop"
                  type="text"
                  inputMode="numeric"
                  value={formatAmountForDisplay(localFilters.amountRange?.start)}
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
              <div>
                <label
                  htmlFor="filter-amount-max-desktop"
                  className="mb-4 block text-xs text-gray-50"
                >
                  {t('maxAmount')}
                </label>
                <input
                  id="filter-amount-max-desktop"
                  type="text"
                  inputMode="numeric"
                  value={formatAmountForDisplay(localFilters.amountRange?.end)}
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
              <p className="text-xs italic text-gray-50">*{t('amountFilterHint')}</p>
              {validationErrors.amount && (
                <p className="text-xs text-red-400">{validationErrors.amount}</p>
              )}
              <button
                type="button"
                onClick={() =>
                  handleApplyRangeFilter(
                    'amountRange',
                    localFilters.amountRange?.start,
                    localFilters.amountRange?.end
                  )
                }
                className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
              >
                {t('filterButton')}
              </button>
            </div>
          </div>
        </FilterDropdown>

        {/* Date Filter */}
        <FilterDropdown
          label={getDateLabel()}
          isActive={isDateActive}
          show={openDropdown === 'date'}
          onToggle={() => handleToggle('date')}
          onClear={isDateActive ? clearDateFilter : undefined}
          contentClassName="min-w-[280px]"
          allowFullWidth
        >
          <div className="space-y-12">
            <div className="flex flex-wrap gap-6">
              {DATE_PRESETS.map((preset) => {
                const isSelected = activeFilters.dateRange?.presetDays === preset.days
                const presetLabel = preset.daysCount
                  ? t(preset.labelKey, { count: preset.daysCount })
                  : t(preset.labelKey)
                return (
                  <button
                    key={`${preset.labelKey}-${preset.days}`}
                    type="button"
                    aria-label={presetLabel}
                    onClick={() => handleApplyDatePreset(preset.days)}
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
            <div className="space-y-8">
              <p className="text-xs font-medium text-gray-50">{t('customRange')}</p>
              <DateTimeInput
                id="filter-date-start-desktop"
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
                id="filter-date-end-desktop"
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
              <button
                type="button"
                onClick={() =>
                  handleApplyRangeFilter(
                    'dateRange',
                    localFilters.dateRange?.start,
                    localFilters.dateRange?.end
                  )
                }
                className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
              >
                {t('filterButton')}
              </button>
            </div>
          </div>
        </FilterDropdown>

        {/* Input Type Filter */}
        <FilterDropdown
          label={getInputTypeLabel()}
          isActive={isInputTypeActive}
          show={openDropdown === 'inputType'}
          onToggle={() => handleToggle('inputType')}
          onClear={isInputTypeActive ? clearInputTypeFilter : undefined}
          contentClassName="min-w-[200px]"
        >
          <div className="space-y-12">
            <div className="flex gap-8">
              <div className="flex-1">
                <label
                  htmlFor="filter-inputtype-start-desktop"
                  className="mb-4 block text-xs text-gray-50"
                >
                  {t('minInputType')}
                </label>
                <input
                  id="filter-inputtype-start-desktop"
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
                  htmlFor="filter-inputtype-end-desktop"
                  className="mb-4 block text-xs text-gray-50"
                >
                  {t('maxInputType')}
                </label>
                <input
                  id="filter-inputtype-end-desktop"
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
            <button
              type="button"
              onClick={() => {
                if (localFilters.inputTypeRange?.start && localFilters.inputTypeRange?.end) {
                  const startNum = Number(localFilters.inputTypeRange.start)
                  const endNum = Number(localFilters.inputTypeRange.end)
                  if (startNum > endNum) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      inputType: t('invalidRangeInputType')
                    }))
                    return
                  }
                }
                setValidationErrors((prev) => ({ ...prev, inputType: null }))
                const newFilters = {
                  ...activeFilters,
                  inputTypeRange:
                    localFilters.inputTypeRange?.start || localFilters.inputTypeRange?.end
                      ? localFilters.inputTypeRange
                      : undefined
                }
                onApplyFilters(newFilters)
                setLocalFilters(newFilters)
                setOpenDropdown(null)
              }}
              className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
            >
              {t('filterButton')}
            </button>
          </div>
        </FilterDropdown>

        {/* Tick Filter */}
        <FilterDropdown
          label={getTickLabel()}
          isActive={isTickActive}
          show={openDropdown === 'tick'}
          onToggle={() => handleToggle('tick')}
          onClear={isTickActive ? clearTickFilter : undefined}
          contentClassName="min-w-[200px]"
        >
          <div className="space-y-12">
            <div className="space-y-8">
              <div>
                <label
                  htmlFor="filter-tick-start-desktop"
                  className="mb-4 block text-xs text-gray-50"
                >
                  {t('startTick')}
                </label>
                <input
                  id="filter-tick-start-desktop"
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
              <div>
                <label
                  htmlFor="filter-tick-end-desktop"
                  className="mb-4 block text-xs text-gray-50"
                >
                  {t('endTick')}
                </label>
                <input
                  id="filter-tick-end-desktop"
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
            <button
              type="button"
              onClick={() => {
                if (localFilters.tickNumberRange?.start && localFilters.tickNumberRange?.end) {
                  const startNum = Number(localFilters.tickNumberRange.start)
                  const endNum = Number(localFilters.tickNumberRange.end)
                  if (startNum >= endNum) {
                    setValidationErrors((prev) => ({ ...prev, tick: t('invalidTickRange') }))
                    return
                  }
                }
                setValidationErrors((prev) => ({ ...prev, tick: null }))
                const newFilters = {
                  ...activeFilters,
                  tickNumberRange:
                    localFilters.tickNumberRange?.start || localFilters.tickNumberRange?.end
                      ? localFilters.tickNumberRange
                      : undefined
                }
                onApplyFilters(newFilters)
                setLocalFilters(newFilters)
                setOpenDropdown(null)
              }}
              className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
            >
              {t('filterButton')}
            </button>
          </div>
        </FilterDropdown>

        {hasActiveFilters && <div className="grow" />}

        {hasActiveFilters && (
          <Tooltip tooltipId="clear-all-filters" content={t('clearAllFiltersTooltip')}>
            <button
              type="button"
              onClick={() => {
                onClearFilters()
                setLocalFilters({})
              }}
              className="flex shrink-0 items-center gap-4 whitespace-nowrap text-xs text-gray-50 transition-colors hover:text-white"
            >
              <UndoIcon className="h-14 w-14" />
              <span>{t('resetFilters')}</span>
            </button>
          </Tooltip>
        )}
      </div>
    </>
  )
}
