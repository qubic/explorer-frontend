import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useBodyScrollLock } from '@app/hooks'
import { MAX_EVENT_TYPE_SELECTIONS } from '@app/store/apis/events'
import DateFilterContent from '../../address/components/TransactionsOverview/DateFilterContent'
import {
  validateAddressFilter,
  type AddressFilter,
  type TransactionDirection
} from '../../address/components/TransactionsOverview/filterUtils'
import DirectionControl from '../../address/components/TransactionsOverview/DirectionControl'
import MultiAddressFilterContent from '../../address/components/TransactionsOverview/MultiAddressFilterContent'
import { scrollToValidationError } from '../../hooks'
import type {
  DateRangeValue,
  EpochRangeValue,
  EventAmountFilter,
  TickRangeValue
} from '../../utils/eventFilterUtils'
import { applyEventDirectionSync } from '../../utils/eventFilterUtils'
import { validateAmountRange } from '../../utils/filterUtils'
import CategorySelect from './CategorySelect'
import EventAmountFilterContent from './EventAmountFilterContent'
import EventTypeChips from './EventTypeChips'
import MobileFiltersModalWrapper from './MobileFiltersModalWrapper'
import MobileFilterSection from './MobileFilterSection'
import RangeFilterContent from './RangeFilterContent'

export type EventsFilters = {
  tickRange?: TickRangeValue
  epochRange?: EpochRangeValue
  eventTypes?: number[]
  category?: number
  dateRange?: DateRangeValue
  sourceFilter?: AddressFilter
  destinationFilter?: AddressFilter
  direction?: TransactionDirection
  amountFilter?: EventAmountFilter
}

type Props = {
  isOpen: boolean
  onClose: () => void
  activeFilters: EventsFilters
  onApplyFilters: (filters: EventsFilters) => void
  idPrefix: string
  showTickFilter?: boolean
  showEpochFilter?: boolean
  showDateFilter?: boolean
  showDirectionFilter?: boolean
  showCategoryFilter?: boolean
  addressId?: string
}

export default function EventsMobileFiltersModal({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
  idPrefix,
  showTickFilter = true,
  showEpochFilter = false,
  showDateFilter = true,
  showDirectionFilter = false,
  showCategoryFilter = false,
  addressId
}: Props) {
  const { t } = useTranslation('network-page')

  useBodyScrollLock(isOpen)

  const [localTickRange, setLocalTickRange] = useState<TickRangeValue | undefined>(
    activeFilters.tickRange
  )
  const [localEpochRange, setLocalEpochRange] = useState<EpochRangeValue | undefined>(
    activeFilters.epochRange
  )
  const [localEventTypes, setLocalEventTypes] = useState<number[]>(activeFilters.eventTypes ?? [])
  const [localCategory, setLocalCategory] = useState<number | undefined>(activeFilters.category)
  const [localDateRange, setLocalDateRange] = useState<DateRangeValue | undefined>(
    activeFilters.dateRange
  )
  const [localSourceFilter, setLocalSourceFilter] = useState<AddressFilter | undefined>(
    activeFilters.sourceFilter
  )
  const [localDestFilter, setLocalDestFilter] = useState<AddressFilter | undefined>(
    activeFilters.destinationFilter
  )
  const [localDirection, setLocalDirection] = useState<TransactionDirection | undefined>(
    activeFilters.direction
  )
  const [localAmountFilter, setLocalAmountFilter] = useState<EventAmountFilter | undefined>(
    activeFilters.amountFilter
  )
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({})

  const handleLocalDirectionChange = useCallback(
    (newDirection: TransactionDirection | undefined) => {
      setLocalDirection(newDirection)
      if (!addressId) return
      const { sourceFilter: newSrc, destinationFilter: newDest } = applyEventDirectionSync(
        newDirection,
        addressId,
        localSourceFilter,
        localDestFilter
      )
      setLocalSourceFilter(newSrc)
      setLocalDestFilter(newDest)
      setValidationErrors({})
    },
    [addressId, localSourceFilter, localDestFilter]
  )

  const handleToggleEventType = useCallback((type: number) => {
    setLocalEventTypes((prev) => {
      if (prev.includes(type)) return prev.filter((v) => v !== type)
      if (prev.length >= MAX_EVENT_TYPE_SELECTIONS) return prev
      return [...prev, type]
    })
  }, [])

  useEffect(() => {
    if (isOpen) {
      setLocalTickRange(activeFilters.tickRange)
      setLocalEpochRange(activeFilters.epochRange)
      setLocalEventTypes(activeFilters.eventTypes ?? [])
      setLocalCategory(activeFilters.category)
      setLocalDateRange(activeFilters.dateRange)
      setLocalSourceFilter(activeFilters.sourceFilter)
      setLocalDestFilter(activeFilters.destinationFilter)
      setLocalDirection(activeFilters.direction)
      setLocalAmountFilter(activeFilters.amountFilter)
      setValidationErrors({})
    }
  }, [
    isOpen,
    activeFilters.tickRange,
    activeFilters.epochRange,
    activeFilters.eventTypes,
    activeFilters.category,
    activeFilters.dateRange,
    activeFilters.sourceFilter,
    activeFilters.destinationFilter,
    activeFilters.direction,
    activeFilters.amountFilter
  ])

  const handleApply = useCallback(() => {
    const errors: Record<string, string | null> = {}
    let firstErrorId: string | null = null

    const sourceError = validateAddressFilter(localSourceFilter)
    if (sourceError) {
      errors.source = t(sourceError)
      if (!firstErrorId) firstErrorId = `${idPrefix}-mobile-source-filter`
    }

    const destError = validateAddressFilter(localDestFilter)
    if (destError) {
      errors.destination = t(destError)
      if (!firstErrorId) firstErrorId = `${idPrefix}-mobile-dest-filter`
    }

    const amountError = validateAmountRange(localAmountFilter?.min, localAmountFilter?.max)
    if (amountError) {
      errors.amount = t(amountError)
      if (!firstErrorId) firstErrorId = `${idPrefix}-mobile-amount-filter`
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      scrollToValidationError(firstErrorId)
      return
    }

    onApplyFilters({
      tickRange: localTickRange,
      epochRange: localEpochRange,
      eventTypes: localEventTypes,
      category: localCategory,
      dateRange: localDateRange,
      sourceFilter: localSourceFilter,
      destinationFilter: localDestFilter,
      direction: localDirection,
      amountFilter: localAmountFilter
    })
    onClose()
    setValidationErrors({})
  }, [
    localTickRange,
    localEpochRange,
    localEventTypes,
    localCategory,
    localDateRange,
    localSourceFilter,
    localDestFilter,
    localDirection,
    localAmountFilter,
    onApplyFilters,
    onClose,
    idPrefix,
    t
  ])

  const handleClose = useCallback(() => {
    onClose()
    setValidationErrors({})
  }, [onClose])

  return (
    <MobileFiltersModalWrapper
      id={`${idPrefix}-mobile-filters-modal`}
      isOpen={isOpen}
      onClose={handleClose}
      onApply={handleApply}
    >
      {showDirectionFilter && (
        <MobileFilterSection id={`${idPrefix}-mobile-direction-filter`} label={t('direction')}>
          <DirectionControl value={localDirection} onChange={handleLocalDirectionChange} />
        </MobileFilterSection>
      )}

      <MobileFilterSection id={`${idPrefix}-mobile-event-type-filter`} label={t('eventType')}>
        <EventTypeChips selectedTypes={localEventTypes} onToggle={handleToggleEventType} />
      </MobileFilterSection>

      <MobileFilterSection id={`${idPrefix}-mobile-source-filter`} label={t('source')}>
        <MultiAddressFilterContent
          id={`${idPrefix}-mobile-source`}
          value={localSourceFilter}
          onChange={setLocalSourceFilter}
          onApply={() => {}}
          showApplyButton={false}
          error={validationErrors.source}
        />
      </MobileFilterSection>

      <MobileFilterSection id={`${idPrefix}-mobile-dest-filter`} label={t('destination')}>
        <MultiAddressFilterContent
          id={`${idPrefix}-mobile-dest`}
          value={localDestFilter}
          onChange={setLocalDestFilter}
          onApply={() => {}}
          showApplyButton={false}
          error={validationErrors.destination}
        />
      </MobileFilterSection>

      <MobileFilterSection id={`${idPrefix}-mobile-amount-filter`} label={t('amount')}>
        <EventAmountFilterContent
          idPrefix={`${idPrefix}-mobile-amount`}
          value={localAmountFilter}
          onChange={setLocalAmountFilter}
          onApply={() => {}}
          showApplyButton={false}
          layout="horizontal"
          error={validationErrors.amount}
        />
      </MobileFilterSection>

      {showDateFilter && (
        <MobileFilterSection id={`${idPrefix}-mobile-date-filter`} label={t('date')}>
          <DateFilterContent
            idPrefix={`${idPrefix}-mobile-date`}
            value={localDateRange}
            onChange={setLocalDateRange}
            onApply={() => {}}
            selectedPresetDays={localDateRange?.presetDays}
            showApplyButton={false}
          />
        </MobileFilterSection>
      )}

      {showTickFilter && (
        <MobileFilterSection id={`${idPrefix}-mobile-tick-filter`} label={t('tick')}>
          <RangeFilterContent
            idPrefix={`${idPrefix}-mobile-tick-range`}
            value={localTickRange}
            onChange={setLocalTickRange}
            onApply={() => {}}
            startLabel={t('startTick')}
            endLabel={t('endTick')}
            showApplyButton={false}
            layout="horizontal"
            formatDisplay={false}
          />
        </MobileFilterSection>
      )}

      {showEpochFilter && (
        <MobileFilterSection id={`${idPrefix}-mobile-epoch-filter`} label={t('epoch')}>
          <RangeFilterContent
            idPrefix={`${idPrefix}-mobile-epoch-range`}
            value={localEpochRange}
            onChange={setLocalEpochRange}
            onApply={() => {}}
            startLabel={t('startEpoch')}
            endLabel={t('endEpoch')}
            showApplyButton={false}
            layout="horizontal"
            formatDisplay={false}
          />
        </MobileFilterSection>
      )}

      {showCategoryFilter && (
        <MobileFilterSection id={`${idPrefix}-mobile-category-filter`} label={t('category')}>
          <CategorySelect value={localCategory} onChange={setLocalCategory} />
        </MobileFilterSection>
      )}
    </MobileFiltersModalWrapper>
  )
}
