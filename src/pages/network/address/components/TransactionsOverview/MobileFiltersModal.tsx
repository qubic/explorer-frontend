import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { XmarkIcon } from '@app/assets/icons'
import { Modal } from '@app/components/ui'
import { isValidAddressFormat } from '@app/utils'
import type {
  AddressFilter,
  TransactionDirection,
  TransactionFilters
} from '../../hooks/useLatestTransactions'
import AmountFilterContent from './AmountFilterContent'
import DateFilterContent from './DateFilterContent'
import DirectionControl from './DirectionControl'
import MultiAddressFilterContent from './MultiAddressFilterContent'
import RangeFilterContent from './RangeFilterContent'
import {
  applyDatePresetCalculation,
  applyDestinationFilterChange,
  applyDirectionChange,
  applySourceFilterChange
} from './filterUtils'

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

  const handleDirectionChange = useCallback(
    (direction: TransactionDirection | undefined) => {
      setLocalFilters((prev) => applyDirectionChange(prev, direction, addressId))
    },
    [addressId]
  )

  const handleSourceFilterChange = useCallback(
    (value: AddressFilter | undefined) => {
      setLocalFilters((prev) => applySourceFilterChange(prev, value, addressId))
    },
    [addressId]
  )

  const handleDestinationFilterChange = useCallback(
    (value: AddressFilter | undefined) => {
      setLocalFilters((prev) => applyDestinationFilterChange(prev, value, addressId))
    },
    [addressId]
  )

  const handleApplyAllFilters = useCallback(() => {
    // Validate before applying - track first error for scrolling
    const errors: Record<string, string> = {}
    let firstErrorId: string | null = null

    // Validate source addresses (multi-address) - format and duplicates
    if (localFilters.sourceFilter?.addresses) {
      const nonEmptyAddresses = localFilters.sourceFilter.addresses.filter(
        (addr) => addr.trim() !== ''
      )
      const invalidAddress = nonEmptyAddresses.find((addr) => !isValidAddressFormat(addr.trim()))
      if (invalidAddress) {
        errors.source = t('invalidAddressFormat')
        if (!firstErrorId) firstErrorId = 'mobile-source-filter'
      } else {
        // Check for duplicates
        const seen = new Set<string>()
        const hasDuplicate = nonEmptyAddresses.some((addr) => {
          const upper = addr.trim().toUpperCase()
          if (seen.has(upper)) return true
          seen.add(upper)
          return false
        })
        if (hasDuplicate) {
          errors.source = t('duplicateAddress')
          if (!firstErrorId) firstErrorId = 'mobile-source-filter'
        }
      }
    }

    // Validate destination addresses (multi-address) - format and duplicates
    if (localFilters.destinationFilter?.addresses) {
      const nonEmptyAddresses = localFilters.destinationFilter.addresses.filter(
        (addr) => addr.trim() !== ''
      )
      const invalidAddress = nonEmptyAddresses.find((addr) => !isValidAddressFormat(addr.trim()))
      if (invalidAddress) {
        errors.destination = t('invalidAddressFormat')
        if (!firstErrorId) firstErrorId = 'mobile-destination-filter'
      } else {
        // Check for duplicates
        const seen = new Set<string>()
        const hasDuplicate = nonEmptyAddresses.some((addr) => {
          const upper = addr.trim().toUpperCase()
          if (seen.has(upper)) return true
          seen.add(upper)
          return false
        })
        if (hasDuplicate) {
          errors.destination = t('duplicateAddress')
          if (!firstErrorId) firstErrorId = 'mobile-destination-filter'
        }
      }
    }

    // Validate amount range
    if (localFilters.amountRange?.start && localFilters.amountRange?.end) {
      const startNum = Number(localFilters.amountRange.start)
      const endNum = Number(localFilters.amountRange.end)
      if (startNum > endNum) {
        errors.amount = t('invalidRangeAmount')
        if (!firstErrorId) firstErrorId = 'mobile-amount-filter'
      }
    }

    // Validate date range
    if (localFilters.dateRange?.start && localFilters.dateRange?.end) {
      const startDate = new Date(localFilters.dateRange.start)
      const endDate = new Date(localFilters.dateRange.end)
      if (startDate > endDate) {
        errors.date = t('invalidDateRange')
        if (!firstErrorId) firstErrorId = 'mobile-date-filter'
      }
    }

    // Validate inputType range
    if (localFilters.inputTypeRange?.start && localFilters.inputTypeRange?.end) {
      const startNum = Number(localFilters.inputTypeRange.start)
      const endNum = Number(localFilters.inputTypeRange.end)
      if (startNum > endNum) {
        errors.inputType = t('invalidRangeInputType')
        if (!firstErrorId) firstErrorId = 'mobile-inputtype-filter'
      }
    }

    // Validate tick range (start must be less than end, not equal)
    if (localFilters.tickNumberRange?.start && localFilters.tickNumberRange?.end) {
      const startNum = Number(localFilters.tickNumberRange.start)
      const endNum = Number(localFilters.tickNumberRange.end)
      if (startNum >= endNum) {
        errors.tick = t('invalidTickRange')
        if (!firstErrorId) firstErrorId = 'mobile-tick-filter'
      }
    }

    // If there are errors, set them and scroll to first error
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      if (firstErrorId) {
        setTimeout(() => {
          document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
      return
    }

    // Calculate date from presetDays at apply time (shared utility with desktop)
    const filtersToApply = applyDatePresetCalculation(localFilters)
    onApplyFilters(filtersToApply)
    onClose()
    setValidationErrors({})
  }, [localFilters, onApplyFilters, onClose, t])

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
              <DirectionControl value={localFilters.direction} onChange={handleDirectionChange} />
            </div>

            {/* Source */}
            <div id="mobile-source-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('source')}</h3>
              <MultiAddressFilterContent
                id="filter-source-mobile"
                value={localFilters.sourceFilter}
                onChange={handleSourceFilterChange}
                onApply={() => {}}
                showApplyButton={false}
                error={validationErrors.source}
              />
            </div>

            {/* Destination */}
            <div id="mobile-destination-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('destination')}*</h3>
              <MultiAddressFilterContent
                id="filter-destination-mobile"
                value={localFilters.destinationFilter}
                onChange={handleDestinationFilterChange}
                onApply={() => {}}
                showApplyButton={false}
                hint={t('destinationFilterHint')}
                error={validationErrors.destination}
              />
            </div>

            {/* Amount */}
            <div id="mobile-amount-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('amount')}</h3>
              <AmountFilterContent
                idPrefix="filter-amount-mobile"
                value={localFilters.amountRange}
                onChange={(value) => setLocalFilters((prev) => ({ ...prev, amountRange: value }))}
                onApply={() => {}}
                selectedPresetKey={localFilters.amountRange?.presetKey}
                error={validationErrors.amount}
                showApplyButton={false}
                layout="horizontal"
              />
            </div>

            {/* Date */}
            <div id="mobile-date-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('date')}</h3>
              <DateFilterContent
                idPrefix="filter-date-mobile"
                value={localFilters.dateRange}
                onChange={(value) => setLocalFilters((prev) => ({ ...prev, dateRange: value }))}
                onApply={() => {}}
                selectedPresetDays={localFilters.dateRange?.presetDays}
                error={validationErrors.date}
                showApplyButton={false}
              />
            </div>

            {/* Input Type */}
            <div id="mobile-inputtype-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('inputType')}</h3>
              <RangeFilterContent
                idPrefix="filter-inputtype-mobile"
                value={localFilters.inputTypeRange}
                onChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, inputTypeRange: value }))
                }
                onApply={() => {}}
                startLabel={t('minInputType')}
                endLabel={t('maxInputType')}
                error={validationErrors.inputType}
                showApplyButton={false}
                layout="horizontal"
                formatDisplay={false}
              />
            </div>

            {/* Tick */}
            <div id="mobile-tick-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('tick')}</h3>
              <RangeFilterContent
                idPrefix="filter-tick-mobile"
                value={localFilters.tickNumberRange}
                onChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, tickNumberRange: value }))
                }
                onApply={() => {}}
                startLabel={t('startTick')}
                endLabel={t('endTick')}
                error={validationErrors.tick}
                showApplyButton={false}
                layout="horizontal"
              />
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
