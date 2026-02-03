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
} from '../../components/filters'
import { formatRangeLabel, useAmountPresetHandler, useClearFilterHandler } from '../../hooks'
import AddressFilterContent from './AddressFilterContent'
import TickMobileFiltersModal from './TickMobileFiltersModal'
import type { TickTransactionFilters } from './tickFilterUtils'
import {
  AMOUNT_PRESETS,
  formatAddressShort,
  formatAmountShort,
  hasActiveFilters,
  validateAddress,
  validateAmountRange,
  validateInputTypeRange
} from './tickFilterUtils'

type Props = {
  activeFilters: TickTransactionFilters
  onApplyFilters: (filters: TickTransactionFilters) => void
  onClearFilters: () => void
}

export default function TickTransactionFiltersBar({
  activeFilters,
  onApplyFilters,
  onClearFilters
}: Props) {
  const { t } = useTranslation('network-page')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)

  const [localFilters, setLocalFilters] = useState<TickTransactionFilters>(activeFilters)
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
            inputTypeRange: undefined
          }))
          return null
        }
        // Opening dropdown - sync local filters with active filters
        const isAmountPreset = !!activeFilters.amountRange?.presetKey
        setLocalFilters({
          ...activeFilters,
          amountRange: isAmountPreset ? undefined : activeFilters.amountRange
        })
        return dropdown
      })
    },
    [activeFilters]
  )

  const handleApplyAddressFilter = useCallback(
    (filterKey: 'source' | 'destination') => {
      const address = localFilters[filterKey]
      const validationError = validateAddress(address)

      if (validationError) {
        setValidationErrors((prev) => ({ ...prev, [filterKey]: t(validationError) }))
        return
      }

      setValidationErrors((prev) => ({ ...prev, [filterKey]: null }))

      const newFilters = {
        ...activeFilters,
        [filterKey]: address?.trim() || undefined
      }
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown(null)
    },
    [activeFilters, localFilters, onApplyFilters, t]
  )

  const handleApplyRangeFilter = useCallback(
    (
      filterKey: 'amountRange' | 'inputTypeRange',
      start: string | undefined,
      end: string | undefined
    ) => {
      const dropdownKeyMap: Record<typeof filterKey, string> = {
        amountRange: 'amount',
        inputTypeRange: 'inputType'
      }
      const dropdownKey = dropdownKeyMap[filterKey]

      // Validation functions return final translation keys directly
      let validationError: string | null
      if (filterKey === 'amountRange') {
        validationError = validateAmountRange(start, end)
      } else {
        validationError = validateInputTypeRange(start, end)
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

  // Use shared hooks for amount preset and clear handlers
  const handleApplyAmountPreset = useAmountPresetHandler(
    activeFilters,
    onApplyFilters,
    setLocalFilters,
    setOpenDropdown
  )

  // Clear handlers using shared hook
  const clearSourceFilter = useClearFilterHandler(
    'source',
    activeFilters,
    onApplyFilters,
    setLocalFilters
  )
  const clearDestinationFilter = useClearFilterHandler(
    'destination',
    activeFilters,
    onApplyFilters,
    setLocalFilters
  )
  const clearAmountFilter = useClearFilterHandler(
    'amountRange',
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

  // Check for active filters
  const filtersActive = hasActiveFilters(activeFilters)

  // Check for active individual filters
  const isSourceActive = !!activeFilters.source?.trim()
  const isDestinationActive = !!activeFilters.destination?.trim()
  const isAmountActive = !!(activeFilters.amountRange?.start || activeFilters.amountRange?.end)
  const isInputTypeActive = !!(
    activeFilters.inputTypeRange?.start || activeFilters.inputTypeRange?.end
  )

  // Get display labels for active filters
  const getSourceLabel = () => {
    const source = activeFilters.source?.trim()
    if (!source) return t('source')
    return `${t('source')}: ${formatAddressShort(source)}`
  }

  const getDestinationLabel = () => {
    const destination = activeFilters.destination?.trim()
    if (!destination) return t('destination')
    return `${t('destination')}: ${formatAddressShort(destination)}`
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

  const getInputTypeLabel = () => formatRangeLabel(t('inputType'), activeFilters.inputTypeRange)

  return (
    <>
      {/* Mobile: Filters button on top, active filter chips below */}
      <div className="mb-16 flex flex-col gap-10 sm:hidden">
        <div className="flex items-center justify-end">
          <MobileFiltersButton onClick={() => setIsMobileModalOpen(true)} />
        </div>

        {filtersActive && (
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
      <TickMobileFiltersModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        activeFilters={activeFilters}
        onApplyFilters={onApplyFilters}
      />

      {/* Desktop: Original dropdown filters */}
      <div className="mb-16 hidden w-full flex-wrap items-center gap-8 sm:flex">
        <FunnelIcon className="h-16 w-16 text-gray-50" />

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
            id="tick-filter-source-desktop"
            value={localFilters.source}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, source: value }))}
            onApply={() => handleApplyAddressFilter('source')}
            error={validationErrors.source}
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
            id="tick-filter-destination-desktop"
            value={localFilters.destination}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, destination: value }))}
            onApply={() => handleApplyAddressFilter('destination')}
            error={validationErrors.destination}
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
            idPrefix="tick-filter-amount-desktop"
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
            idPrefix="tick-filter-inputtype-desktop"
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

        {filtersActive && <div className="grow" />}

        {filtersActive && (
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
