import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FunnelIcon, UndoIcon } from '@app/assets/icons'
import Tooltip from '@app/components/ui/Tooltip'
import type { TransactionDirection, TransactionFilters } from '../../hooks/useLatestTransactions'
import ActiveFilterChip from './ActiveFilterChip'
import AddressFilterContent from './AddressFilterContent'
import AmountFilterContent from './AmountFilterContent'
import DateFilterContent from './DateFilterContent'
import DirectionControl from './DirectionControl'
import FilterDropdown from './FilterDropdown'
import MobileFiltersModal from './MobileFiltersModal'
import RangeFilterContent from './RangeFilterContent'
import {
  AMOUNT_PRESETS,
  DATE_PRESETS,
  formatAmountForDisplay,
  formatAmountShort,
  getStartDateFromDays
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
    (preset: { labelKey: string; start?: string; end?: string }) => {
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

        <DirectionControl
          value={activeFilters.direction}
          onChange={handleDirectionChange}
          showTooltips
        />

        {/* Source Filter */}
        <FilterDropdown
          label={getSourceLabel()}
          isActive={isSourceActive}
          show={openDropdown === 'source'}
          onToggle={() => handleToggle('source')}
          onClear={isSourceActive ? clearSourceFilter : undefined}
          contentClassName="min-w-[300px]"
        >
          <AddressFilterContent
            id="filter-source-desktop-standalone"
            value={localFilters.source}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, source: value }))}
            onApply={() => {
              const newFilters = { ...activeFilters, source: localFilters.source || undefined }
              onApplyFilters(newFilters)
              setLocalFilters(newFilters)
              setOpenDropdown(null)
            }}
          />
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
          <AddressFilterContent
            id="filter-destination-desktop-standalone"
            value={localFilters.destination}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, destination: value }))}
            onApply={() => {
              const newFilters = {
                ...activeFilters,
                destination: localFilters.destination || undefined
              }
              onApplyFilters(newFilters)
              setLocalFilters(newFilters)
              setOpenDropdown(null)
            }}
            hint={t('destinationFilterHint')}
          />
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
          <AmountFilterContent
            idPrefix="filter-amount-desktop"
            value={localFilters.amountRange}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, amountRange: value }))}
            onApply={() =>
              handleApplyRangeFilter(
                'amountRange',
                localFilters.amountRange?.start,
                localFilters.amountRange?.end
              )
            }
            onPresetSelect={(preset) => handleApplyAmountPreset(preset)}
            selectedPresetKey={activeFilters.amountRange?.presetKey}
            error={validationErrors.amount}
          />
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
          <DateFilterContent
            idPrefix="filter-date-desktop"
            value={localFilters.dateRange}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, dateRange: value }))}
            onApply={() =>
              handleApplyRangeFilter(
                'dateRange',
                localFilters.dateRange?.start,
                localFilters.dateRange?.end
              )
            }
            onPresetSelect={(presetDays) => handleApplyDatePreset(presetDays)}
            selectedPresetDays={activeFilters.dateRange?.presetDays}
            error={validationErrors.date}
          />
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
          <RangeFilterContent
            idPrefix="filter-inputtype-desktop"
            value={localFilters.inputTypeRange}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, inputTypeRange: value }))}
            onApply={() =>
              handleApplyRangeFilter(
                'inputTypeRange',
                localFilters.inputTypeRange?.start,
                localFilters.inputTypeRange?.end
              )
            }
            startLabel={t('minInputType')}
            endLabel={t('maxInputType')}
            error={validationErrors.inputType}
            layout="horizontal"
            formatDisplay={false}
          />
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
          <RangeFilterContent
            idPrefix="filter-tick-desktop"
            value={localFilters.tickNumberRange}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, tickNumberRange: value }))}
            onApply={() =>
              handleApplyRangeFilter(
                'tickNumberRange',
                localFilters.tickNumberRange?.start,
                localFilters.tickNumberRange?.end
              )
            }
            startLabel={t('startTick')}
            endLabel={t('endTick')}
            error={validationErrors.tick}
          />
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
