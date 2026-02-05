import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBodyScrollLock } from '@app/hooks'
import {
  MobileAmountFilterSection,
  MobileFiltersModalWrapper,
  MobileFilterSection,
  MobileInputTypeFilterSection
} from '../../components/filters'
import { scrollToValidationError, useLocalFilterSync } from '../../hooks'
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

  // Use shared hooks for common patterns
  useBodyScrollLock(isOpen)
  const [localFilters, setLocalFilters, validationErrors, setValidationErrors] =
    useLocalFilterSync<TickTransactionFilters>(isOpen, activeFilters)

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
      scrollToValidationError(firstErrorId)
      return
    }

    onApplyFilters(localFilters)
    onClose()
    setValidationErrors({})
  }, [localFilters, onApplyFilters, onClose, setValidationErrors, t])

  const handleClose = useCallback(() => {
    onClose()
    setValidationErrors({})
  }, [onClose, setValidationErrors])

  return (
    <MobileFiltersModalWrapper
      id="tick-mobile-filters-modal"
      isOpen={isOpen}
      onClose={handleClose}
      onApply={handleApplyAllFilters}
    >
      <MobileFilterSection id="tick-mobile-source-filter" label={t('source')}>
        <AddressFilterContent
          id="tick-filter-source-mobile"
          value={localFilters.source}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, source: value }))}
          onApply={() => {}}
          showApplyButton={false}
          error={validationErrors.source}
        />
      </MobileFilterSection>

      <MobileFilterSection id="tick-mobile-destination-filter" label={t('destination')}>
        <AddressFilterContent
          id="tick-filter-destination-mobile"
          value={localFilters.destination}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, destination: value }))}
          onApply={() => {}}
          showApplyButton={false}
          error={validationErrors.destination}
        />
      </MobileFilterSection>

      <MobileAmountFilterSection
        sectionId="tick-mobile-amount-filter"
        idPrefix="tick-filter-amount-mobile"
        value={localFilters.amountRange}
        onChange={(value) => setLocalFilters((prev) => ({ ...prev, amountRange: value }))}
        error={validationErrors.amount}
      />

      <MobileInputTypeFilterSection
        sectionId="tick-mobile-inputtype-filter"
        idPrefix="tick-filter-inputtype-mobile"
        value={localFilters.inputTypeRange}
        onChange={(value) => setLocalFilters((prev) => ({ ...prev, inputTypeRange: value }))}
        error={validationErrors.inputType}
      />
    </MobileFiltersModalWrapper>
  )
}
