import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { XmarkIcon } from '@app/assets/icons'
import { Modal } from '@app/components/ui'
import { isValidAddressFormat } from '@app/utils'
import type { TransactionDirection, TransactionFilters } from '../../hooks/useLatestTransactions'
import AddressFilterContent from './AddressFilterContent'
import AmountFilterContent from './AmountFilterContent'
import DateFilterContent from './DateFilterContent'
import DirectionControl from './DirectionControl'
import RangeFilterContent from './RangeFilterContent'
import { getStartDateFromDays } from './filterUtils'

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
      setLocalFilters((prev) => {
        const newFilters = { ...prev, direction }

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

        return newFilters
      })
    },
    [addressId]
  )

  const handleSourceChange = useCallback(
    (value: string | undefined) => {
      setLocalFilters((prev) => {
        const newFilters = { ...prev, source: value }
        // Auto-select direction when source matches addressId
        if (value === addressId && prev.direction !== 'outgoing') {
          newFilters.direction = 'outgoing'
          if (prev.destination === addressId) {
            newFilters.destination = undefined
          }
        }
        // Clear direction when source is cleared and it was previously addressId (outgoing)
        if (!value && prev.source === addressId && prev.direction === 'outgoing') {
          newFilters.direction = undefined
        }
        return newFilters
      })
    },
    [addressId]
  )

  const handleDestinationChange = useCallback(
    (value: string | undefined) => {
      setLocalFilters((prev) => {
        const newFilters = { ...prev, destination: value }
        // Auto-select direction when destination matches addressId
        if (value === addressId && prev.direction !== 'incoming') {
          newFilters.direction = 'incoming'
          if (prev.source === addressId) {
            newFilters.source = undefined
          }
        }
        // Clear direction when destination is cleared and it was previously addressId (incoming)
        if (!value && prev.destination === addressId && prev.direction === 'incoming') {
          newFilters.direction = undefined
        }
        return newFilters
      })
    },
    [addressId]
  )

  const handleApplyAllFilters = useCallback(() => {
    // Validate before applying
    let hasError = false

    // Validate source address
    if (localFilters.source && !isValidAddressFormat(localFilters.source)) {
      setValidationErrors((prev) => ({ ...prev, source: t('invalidAddressFormat') }))
      hasError = true
    }

    // Validate destination address
    if (localFilters.destination && !isValidAddressFormat(localFilters.destination)) {
      setValidationErrors((prev) => ({ ...prev, destination: t('invalidAddressFormat') }))
      hasError = true
    }

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
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('source')}</h3>
              <AddressFilterContent
                id="filter-source"
                value={localFilters.source}
                onChange={handleSourceChange}
                onApply={() => {}}
                showApplyButton={false}
                showClearButton
                error={validationErrors.source}
              />
            </div>

            {/* Destination */}
            <div>
              <h3 className="mb-8 text-sm font-medium text-white">{t('destination')}*</h3>
              <AddressFilterContent
                id="filter-destination"
                value={localFilters.destination}
                onChange={handleDestinationChange}
                onApply={() => {}}
                showApplyButton={false}
                showClearButton
                hint={t('destinationFilterHint')}
                error={validationErrors.destination}
              />
            </div>

            {/* Amount */}
            <div>
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
            <div>
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
            <div>
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
