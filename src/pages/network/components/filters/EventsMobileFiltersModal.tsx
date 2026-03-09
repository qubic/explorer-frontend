import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useBodyScrollLock } from '@app/hooks'
import DateFilterContent from '../../address/components/TransactionsOverview/DateFilterContent'
import type { AddressFilter } from '../../address/components/TransactionsOverview/filterUtils'
import MultiAddressFilterContent from '../../address/components/TransactionsOverview/MultiAddressFilterContent'
import type { DateRangeValue, TickRangeValue } from '../../utils/eventFilterUtils'
import EventTypeChips from './EventTypeChips'
import MobileFiltersModalWrapper from './MobileFiltersModalWrapper'
import MobileFilterSection from './MobileFilterSection'
import RangeFilterContent from './RangeFilterContent'

export type EventsFilters = {
  tickRange?: TickRangeValue
  eventType?: number
  dateRange?: DateRangeValue
  sourceFilter?: AddressFilter
  destinationFilter?: AddressFilter
}

type Props = {
  isOpen: boolean
  onClose: () => void
  activeFilters: EventsFilters
  onApplyFilters: (filters: EventsFilters) => void
  idPrefix: string
  showTickFilter?: boolean
  showDateFilter?: boolean
}

export default function EventsMobileFiltersModal({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
  idPrefix,
  showTickFilter = true,
  showDateFilter = true
}: Props) {
  const { t } = useTranslation('network-page')

  useBodyScrollLock(isOpen)

  const [localTickRange, setLocalTickRange] = useState<TickRangeValue | undefined>(
    activeFilters.tickRange
  )
  const [localEventType, setLocalEventType] = useState(activeFilters.eventType)
  const [localDateRange, setLocalDateRange] = useState<DateRangeValue | undefined>(
    activeFilters.dateRange
  )
  const [localSourceFilter, setLocalSourceFilter] = useState<AddressFilter | undefined>(
    activeFilters.sourceFilter
  )
  const [localDestFilter, setLocalDestFilter] = useState<AddressFilter | undefined>(
    activeFilters.destinationFilter
  )

  useEffect(() => {
    if (isOpen) {
      setLocalTickRange(activeFilters.tickRange)
      setLocalEventType(activeFilters.eventType)
      setLocalDateRange(activeFilters.dateRange)
      setLocalSourceFilter(activeFilters.sourceFilter)
      setLocalDestFilter(activeFilters.destinationFilter)
    }
  }, [
    isOpen,
    activeFilters.tickRange,
    activeFilters.eventType,
    activeFilters.dateRange,
    activeFilters.sourceFilter,
    activeFilters.destinationFilter
  ])

  const handleApply = useCallback(() => {
    onApplyFilters({
      tickRange: localTickRange,
      eventType: localEventType,
      dateRange: localDateRange,
      sourceFilter: localSourceFilter,
      destinationFilter: localDestFilter
    })
    onClose()
  }, [
    localTickRange,
    localEventType,
    localDateRange,
    localSourceFilter,
    localDestFilter,
    onApplyFilters,
    onClose
  ])

  return (
    <MobileFiltersModalWrapper
      id={`${idPrefix}-mobile-filters-modal`}
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
    >
      <MobileFilterSection id={`${idPrefix}-mobile-event-type-filter`} label={t('eventType')}>
        <EventTypeChips selectedType={localEventType} onSelectType={setLocalEventType} />
      </MobileFilterSection>

      <MobileFilterSection id={`${idPrefix}-mobile-source-filter`} label={t('source')}>
        <MultiAddressFilterContent
          id={`${idPrefix}-mobile-source`}
          value={localSourceFilter}
          onChange={setLocalSourceFilter}
          onApply={handleApply}
          showApplyButton={false}
        />
      </MobileFilterSection>

      <MobileFilterSection id={`${idPrefix}-mobile-dest-filter`} label={t('destination')}>
        <MultiAddressFilterContent
          id={`${idPrefix}-mobile-dest`}
          value={localDestFilter}
          onChange={setLocalDestFilter}
          onApply={handleApply}
          showApplyButton={false}
        />
      </MobileFilterSection>

      {showDateFilter && (
        <MobileFilterSection id={`${idPrefix}-mobile-date-filter`} label={t('date')}>
          <DateFilterContent
            idPrefix={`${idPrefix}-mobile-date`}
            value={localDateRange}
            onChange={setLocalDateRange}
            onApply={handleApply}
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
            onApply={handleApply}
            startLabel={t('startTick')}
            endLabel={t('endTick')}
            showApplyButton={false}
            layout="horizontal"
            formatDisplay={false}
          />
        </MobileFilterSection>
      )}
    </MobileFiltersModalWrapper>
  )
}
