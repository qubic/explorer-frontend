import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FunnelIcon } from '@app/assets/icons'
import {
  ActiveFilterChip,
  AmountFilterContent,
  FilterDropdown,
  MobileFiltersButton,
  RangeFilterContent,
  ResetFiltersButton
} from '../../../components/filters'
import { formatRangeLabel, useAmountPresetHandler, useClearFilterHandler } from '../../../hooks'
import type {
  AddressFilter,
  TransactionDirection,
  TransactionFilters
} from '../../hooks/useLatestTransactions'
import DateFilterContent from './DateFilterContent'
import DirectionControl from './DirectionControl'
import MobileFiltersModal from './MobileFiltersModal'
import MultiAddressFilterContent from './MultiAddressFilterContent'
import {
  AMOUNT_PRESETS,
  applyDatePresetCalculation,
  applyDestinationFilterChange,
  applyDirectionChange,
  applySourceFilterChange,
  DATE_PRESETS,
  formatAddressShort,
  formatAmountForDisplay,
  formatAmountShort,
  validateAmountRange,
  validateDateRange,
  validateInputTypeRange,
  validateTickRange
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
            dateRange: undefined,
            tickNumberRange: undefined,
            inputTypeRange: undefined
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
      const dropdownKeyMap: Record<typeof filterKey, string> = {
        amountRange: 'amount',
        tickNumberRange: 'tick',
        dateRange: 'date',
        inputTypeRange: 'inputType'
      }
      const dropdownKey = dropdownKeyMap[filterKey]

      // Validation functions return final translation keys directly
      let validationError: string | null
      if (filterKey === 'dateRange') {
        validationError = validateDateRange(start, end)
      } else if (filterKey === 'inputTypeRange') {
        validationError = validateInputTypeRange(start, end)
      } else if (filterKey === 'amountRange') {
        validationError = validateAmountRange(start, end)
      } else {
        validationError = validateTickRange(start, end)
      }

      if (validationError) {
        setValidationErrors((prev) => ({ ...prev, [dropdownKey]: t(validationError) }))
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
      // Store presetDays first, then calculate date at apply time (unified with mobile approach)
      const filtersWithPreset = {
        ...activeFilters,
        dateRange: { presetDays, start: undefined, end: undefined }
      }
      const newFilters = applyDatePresetCalculation(filtersWithPreset)
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown(null)
    },
    [activeFilters, onApplyFilters]
  )

  // Use shared hooks for amount preset and simple clear handlers
  const handleApplyAmountPreset = useAmountPresetHandler(
    activeFilters,
    onApplyFilters,
    setLocalFilters,
    setOpenDropdown
  )

  // Simple clear handlers using shared hook
  const clearAmountFilter = useClearFilterHandler(
    'amountRange',
    activeFilters,
    onApplyFilters,
    setLocalFilters
  )
  const clearDateFilter = useClearFilterHandler(
    'dateRange',
    activeFilters,
    onApplyFilters,
    setLocalFilters
  )
  const clearTickFilter = useClearFilterHandler(
    'tickNumberRange',
    activeFilters,
    onApplyFilters,
    setLocalFilters
  )
  const clearInputTypeFilter = useClearFilterHandler(
    'inputTypeRange',
    activeFilters,
    onApplyFilters,
    setLocalFilters
  )

  // Source/destination clear handlers need special logic for direction sync
  const clearSourceFilter = useCallback(() => {
    const newFilters = applySourceFilterChange(activeFilters, undefined, addressId)
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters, addressId])

  const clearDestinationFilter = useCallback(() => {
    const newFilters = applyDestinationFilterChange(activeFilters, undefined, addressId)
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters, addressId])

  const handleDirectionChange = useCallback(
    (direction: TransactionDirection | undefined) => {
      const newFilters = applyDirectionChange(activeFilters, direction, addressId)
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
    if (key === 'sourceFilter' || key === 'destinationFilter') {
      const filter = value as AddressFilter | undefined
      return filter?.addresses && filter.addresses.some((addr) => addr.trim() !== '')
    }
    return key !== 'amount' && typeof value === 'string' && value.trim() !== ''
  })

  // Check for active multi-address filters
  const sourceAddresses =
    activeFilters.sourceFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []
  const destinationAddresses =
    activeFilters.destinationFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []
  const isSourceActive = sourceAddresses.length > 0
  const isDestinationActive = destinationAddresses.length > 0
  const isAmountActive = !!(activeFilters.amountRange?.start || activeFilters.amountRange?.end)
  const isDateActive = !!(activeFilters.dateRange?.start || activeFilters.dateRange?.end)
  const isTickActive = !!(
    activeFilters.tickNumberRange?.start || activeFilters.tickNumberRange?.end
  )
  const isInputTypeActive = !!(
    activeFilters.inputTypeRange?.start || activeFilters.inputTypeRange?.end
  )

  // Get display labels for active filters
  const getSourceLabel = () => {
    if (!isSourceActive) return t('source')
    const mode = activeFilters.sourceFilter?.mode ?? 'include'
    const modeLabel = t(mode)
    if (sourceAddresses.length === 1) {
      return `${t('source')}: ${modeLabel} ${formatAddressShort(sourceAddresses[0])}`
    }
    return `${t('source')}: ${modeLabel} ${sourceAddresses.length}`
  }

  const getDestinationLabel = () => {
    if (!isDestinationActive) return t('destination')
    const mode = activeFilters.destinationFilter?.mode ?? 'include'
    const modeLabel = t(mode)
    if (destinationAddresses.length === 1) {
      return `${t('destination')}: ${modeLabel} ${formatAddressShort(destinationAddresses[0])}`
    }
    return `${t('destination')}: ${modeLabel} ${destinationAddresses.length}`
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

  const getTickLabel = () =>
    formatRangeLabel(t('tick'), activeFilters.tickNumberRange, formatAmountForDisplay)

  const getInputTypeLabel = () => formatRangeLabel(t('inputType'), activeFilters.inputTypeRange)

  return (
    <>
      {/* Mobile: Filters button on top, active filter chips below */}
      <div className="mb-16 flex flex-col gap-10 sm:hidden">
        <div className="flex items-center justify-end">
          <MobileFiltersButton onClick={() => setIsMobileModalOpen(true)} />
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

            <ResetFiltersButton
              onClick={() => {
                onClearFilters()
                setLocalFilters({})
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      <MobileFiltersModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        addressId={addressId}
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
          <MultiAddressFilterContent
            id="filter-source-desktop"
            value={localFilters.sourceFilter}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, sourceFilter: value }))}
            onApply={() => {
              const newFilters = applySourceFilterChange(
                activeFilters,
                localFilters.sourceFilter,
                addressId
              )
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
          <MultiAddressFilterContent
            id="filter-destination-desktop"
            value={localFilters.destinationFilter}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, destinationFilter: value }))}
            onApply={() => {
              const newFilters = applyDestinationFilterChange(
                activeFilters,
                localFilters.destinationFilter,
                addressId
              )
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
          <ResetFiltersButton
            onClick={() => {
              onClearFilters()
              setLocalFilters({})
            }}
            showTooltip
          />
        )}
      </div>
    </>
  )
}
