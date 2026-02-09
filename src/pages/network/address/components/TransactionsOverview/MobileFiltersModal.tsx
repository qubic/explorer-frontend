import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBodyScrollLock } from '@app/hooks'
import {
  MobileAmountFilterSection,
  MobileFiltersModalWrapper,
  MobileFilterSection,
  MobileInputTypeFilterSection,
  RangeFilterContent
} from '../../../components/filters'
import { scrollToValidationError, useLocalFilterSync } from '../../../hooks'
import type {
  AddressFilter,
  TransactionDirection,
  TransactionFilters
} from '../../hooks/useLatestTransactions'
import DateFilterContent from './DateFilterContent'
import DirectionControl from './DirectionControl'
import {
  applyDatePresetCalculation,
  applyDestinationFilterChange,
  applyDirectionChange,
  applySourceFilterChange,
  validateAddressFilter,
  validateAmountRange,
  validateDateRange,
  validateInputTypeRange,
  validateTickRange
} from './filterUtils'
import MultiAddressFilterContent from './MultiAddressFilterContent'
import TxTypeFilterContent from './TxTypeFilterContent'

type Props = {
  isOpen: boolean
  onClose: () => void
  addressId: string
  activeFilters: TransactionFilters
  onApplyFilters: (filters: TransactionFilters) => void
}

export default function MobileFiltersModal({
  isOpen,
  onClose,
  addressId,
  activeFilters,
  onApplyFilters
}: Props) {
  const { t } = useTranslation('network-page')

  // Use shared hooks for common patterns
  useBodyScrollLock(isOpen)
  const [localFilters, setLocalFilters, validationErrors, setValidationErrors] =
    useLocalFilterSync<TransactionFilters>(isOpen, activeFilters)

  const handleDirectionChange = useCallback(
    (direction: TransactionDirection | undefined) => {
      setLocalFilters((prev) => applyDirectionChange(prev, direction, addressId))
    },
    [addressId, setLocalFilters]
  )

  const handleSourceFilterChange = useCallback(
    (value: AddressFilter | undefined) => {
      setLocalFilters((prev) => applySourceFilterChange(prev, value, addressId))
    },
    [addressId, setLocalFilters]
  )

  const handleDestinationFilterChange = useCallback(
    (value: AddressFilter | undefined) => {
      setLocalFilters((prev) => applyDestinationFilterChange(prev, value, addressId))
    },
    [addressId, setLocalFilters]
  )

  const handleApplyAllFilters = useCallback(() => {
    // Validate before applying - track first error for scrolling
    const errors: Record<string, string> = {}
    let firstErrorId: string | null = null

    // Validate source addresses (multi-address) - format and duplicates
    const sourceError = validateAddressFilter(localFilters.sourceFilter)
    if (sourceError) {
      errors.source = t(sourceError)
      if (!firstErrorId) firstErrorId = 'mobile-source-filter'
    }

    // Validate destination addresses (multi-address) - format and duplicates
    const destinationError = validateAddressFilter(localFilters.destinationFilter)
    if (destinationError) {
      errors.destination = t(destinationError)
      if (!firstErrorId) firstErrorId = 'mobile-destination-filter'
    }

    // Validate amount range - returns final translation key directly
    const amountError = validateAmountRange(
      localFilters.amountRange?.start,
      localFilters.amountRange?.end
    )
    if (amountError) {
      errors.amount = t(amountError)
      if (!firstErrorId) firstErrorId = 'mobile-amount-filter'
    }

    // Validate date range
    const dateError = validateDateRange(localFilters.dateRange?.start, localFilters.dateRange?.end)
    if (dateError) {
      errors.date = t(dateError)
      if (!firstErrorId) firstErrorId = 'mobile-date-filter'
    }

    // Validate inputType range - returns final translation key directly
    const inputTypeError = validateInputTypeRange(
      localFilters.inputTypeRange?.start,
      localFilters.inputTypeRange?.end
    )
    if (inputTypeError) {
      errors.inputType = t(inputTypeError)
      if (!firstErrorId) firstErrorId = 'mobile-inputtype-filter'
    }

    // Validate tick range - returns final translation key directly
    const tickError = validateTickRange(
      localFilters.tickNumberRange?.start,
      localFilters.tickNumberRange?.end
    )
    if (tickError) {
      errors.tick = t(tickError)
      if (!firstErrorId) firstErrorId = 'mobile-tick-filter'
    }

    // If there are errors, set them and scroll to first error
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      scrollToValidationError(firstErrorId)
      return
    }

    // Enforce mutual exclusion: if txType is set, set destination to SC address (if SC) and clear inputType
    const mutuallyExclusiveFilters = localFilters.txType
      ? {
          ...localFilters,
          destinationFilter: localFilters.txType.scAddress
            ? { mode: 'include' as const, addresses: [localFilters.txType.scAddress] }
            : undefined,
          inputTypeRange: undefined
        }
      : localFilters

    // Calculate date from presetDays at apply time (shared utility with desktop)
    const filtersToApply = applyDatePresetCalculation(mutuallyExclusiveFilters)
    onApplyFilters(filtersToApply)
    onClose()
    setValidationErrors({})
  }, [localFilters, onApplyFilters, onClose, setValidationErrors, t])

  const handleClose = useCallback(() => {
    onClose()
    setValidationErrors({})
  }, [onClose, setValidationErrors])

  return (
    <MobileFiltersModalWrapper
      id="mobile-filters-modal"
      isOpen={isOpen}
      onClose={handleClose}
      onApply={handleApplyAllFilters}
    >
      <MobileFilterSection id="mobile-direction-filter" label={t('direction')}>
        <DirectionControl value={localFilters.direction} onChange={handleDirectionChange} />
      </MobileFilterSection>

      <MobileFilterSection id="mobile-txtype-filter" label={t('txType')}>
        <TxTypeFilterContent
          value={localFilters.txType}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, txType: value }))}
          onApply={() => {}}
          showApplyButton={false}
        />
      </MobileFilterSection>

      <MobileFilterSection id="mobile-source-filter" label={t('source')}>
        <MultiAddressFilterContent
          id="filter-source-mobile"
          value={localFilters.sourceFilter}
          onChange={handleSourceFilterChange}
          onApply={() => {}}
          showApplyButton={false}
          error={validationErrors.source}
        />
      </MobileFilterSection>

      <div className={localFilters.txType?.scAddress ? 'pointer-events-none opacity-50' : ''}>
        <MobileFilterSection id="mobile-destination-filter" label={`${t('destination')}*`}>
          <MultiAddressFilterContent
            id="filter-destination-mobile"
            value={localFilters.destinationFilter}
            onChange={handleDestinationFilterChange}
            onApply={() => {}}
            showApplyButton={false}
            hint={t('destinationFilterHint')}
            error={validationErrors.destination}
          />
        </MobileFilterSection>
      </div>

      <MobileAmountFilterSection
        sectionId="mobile-amount-filter"
        idPrefix="filter-amount-mobile"
        value={localFilters.amountRange}
        onChange={(value) => setLocalFilters((prev) => ({ ...prev, amountRange: value }))}
        error={validationErrors.amount}
      />

      <MobileFilterSection id="mobile-date-filter" label={t('date')}>
        <DateFilterContent
          idPrefix="filter-date-mobile"
          value={localFilters.dateRange}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, dateRange: value }))}
          onApply={() => {}}
          selectedPresetDays={localFilters.dateRange?.presetDays}
          error={validationErrors.date}
          showApplyButton={false}
        />
      </MobileFilterSection>

      <div className={localFilters.txType ? 'pointer-events-none opacity-50' : ''}>
        <MobileInputTypeFilterSection
          sectionId="mobile-inputtype-filter"
          idPrefix="filter-inputtype-mobile"
          value={localFilters.inputTypeRange}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, inputTypeRange: value }))}
          error={validationErrors.inputType}
        />
      </div>

      <MobileFilterSection id="mobile-tick-filter" label={t('tick')}>
        <RangeFilterContent
          idPrefix="filter-tick-mobile"
          value={localFilters.tickNumberRange}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, tickNumberRange: value }))}
          onApply={() => {}}
          startLabel={t('startTick')}
          endLabel={t('endTick')}
          error={validationErrors.tick}
          showApplyButton={false}
          layout="horizontal"
        />
      </MobileFilterSection>
    </MobileFiltersModalWrapper>
  )
}
