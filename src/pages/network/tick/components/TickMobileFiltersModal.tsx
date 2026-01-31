import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { XmarkIcon } from '@app/assets/icons'
import { Modal } from '@app/components/ui'
import { AmountFilterContent, RangeFilterContent } from '../../components/filters'
import AddressFilterContent from './AddressFilterContent'
import type { TickTransactionFilters } from './tickFilterUtils'
import { validateAddress, validateAmountRange, validateInputTypeRange } from './tickFilterUtils'

type Props = {
  isOpen: boolean
  onClose: () => void
  activeFilters: TickTransactionFilters
  onApplyFilters: (filters: TickTransactionFilters) => void
}

export default function TickMobileFiltersModal({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters
}: Props) {
  const { t } = useTranslation('network-page')
  const [localFilters, setLocalFilters] = useState<TickTransactionFilters>(activeFilters)
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

  const handleApplyAllFilters = useCallback(() => {
    // Validate before applying - track first error for scrolling
    const errors: Record<string, string> = {}
    let firstErrorId: string | null = null

    // Validate source address
    const sourceError = validateAddress(localFilters.source)
    if (sourceError) {
      errors.source = t(sourceError)
      if (!firstErrorId) firstErrorId = 'tick-mobile-source-filter'
    }

    // Validate destination address
    const destinationError = validateAddress(localFilters.destination)
    if (destinationError) {
      errors.destination = t(destinationError)
      if (!firstErrorId) firstErrorId = 'tick-mobile-destination-filter'
    }

    // Validate amount range
    const amountError = validateAmountRange(
      localFilters.amountRange?.start,
      localFilters.amountRange?.end
    )
    if (amountError) {
      errors.amount = t(amountError)
      if (!firstErrorId) firstErrorId = 'tick-mobile-amount-filter'
    }

    // Validate inputType range
    const inputTypeError = validateInputTypeRange(
      localFilters.inputTypeRange?.start,
      localFilters.inputTypeRange?.end
    )
    if (inputTypeError) {
      errors.inputType = t(inputTypeError)
      if (!firstErrorId) firstErrorId = 'tick-mobile-inputtype-filter'
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

    onApplyFilters(localFilters)
    onClose()
    setValidationErrors({})
  }, [localFilters, onApplyFilters, onClose, t])

  return (
    <Modal
      id="tick-mobile-filters-modal"
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
            {/* Source */}
            <div id="tick-mobile-source-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('source')}</h3>
              <AddressFilterContent
                id="tick-filter-source-mobile"
                value={localFilters.source}
                onChange={(value) => setLocalFilters((prev) => ({ ...prev, source: value }))}
                onApply={() => {}}
                showApplyButton={false}
                error={validationErrors.source}
              />
            </div>

            {/* Destination */}
            <div id="tick-mobile-destination-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('destination')}</h3>
              <AddressFilterContent
                id="tick-filter-destination-mobile"
                value={localFilters.destination}
                onChange={(value) => setLocalFilters((prev) => ({ ...prev, destination: value }))}
                onApply={() => {}}
                showApplyButton={false}
                error={validationErrors.destination}
              />
            </div>

            {/* Amount */}
            <div id="tick-mobile-amount-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('amount')}</h3>
              <AmountFilterContent
                idPrefix="tick-filter-amount-mobile"
                value={localFilters.amountRange}
                onChange={(value) => setLocalFilters((prev) => ({ ...prev, amountRange: value }))}
                onApply={() => {}}
                selectedPresetKey={localFilters.amountRange?.presetKey}
                error={validationErrors.amount}
                showApplyButton={false}
                layout="horizontal"
              />
            </div>

            {/* Input Type */}
            <div id="tick-mobile-inputtype-filter">
              <h3 className="mb-8 text-sm font-medium text-white">{t('inputType')}</h3>
              <RangeFilterContent
                idPrefix="tick-filter-inputtype-mobile"
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
