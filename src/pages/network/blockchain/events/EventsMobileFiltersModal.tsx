import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useBodyScrollLock } from '@app/hooks'
import {
  EventTypeChips,
  MobileFiltersModalWrapper,
  MobileFilterSection
} from '../../components/filters'
import { parseNumericInput } from '../../utils/filterUtils'

type EventsFilters = {
  tick?: string
  eventType?: number
}

type Props = {
  isOpen: boolean
  onClose: () => void
  activeFilters: EventsFilters
  onApplyFilters: (filters: EventsFilters) => void
}

export default function EventsMobileFiltersModal({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters
}: Props) {
  const { t } = useTranslation('network-page')

  useBodyScrollLock(isOpen)

  const [localTick, setLocalTick] = useState(activeFilters.tick ?? '')
  const [localEventType, setLocalEventType] = useState(activeFilters.eventType)

  // Re-sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalTick(activeFilters.tick ?? '')
      setLocalEventType(activeFilters.eventType)
    }
  }, [isOpen, activeFilters.tick, activeFilters.eventType])

  const handleApply = useCallback(() => {
    const normalized = parseNumericInput(localTick)
    onApplyFilters({
      tick: normalized && parseInt(normalized, 10) > 0 ? normalized : undefined,
      eventType: localEventType
    })
    onClose()
  }, [localTick, localEventType, onApplyFilters, onClose])

  return (
    <MobileFiltersModalWrapper
      id="events-mobile-filters-modal"
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
    >
      <MobileFilterSection id="events-mobile-tick-filter" label={t('tick')}>
        <input
          type="text"
          inputMode="numeric"
          value={localTick}
          onChange={(e) => setLocalTick(e.target.value)}
          placeholder={t('tick')}
          className="w-full rounded bg-primary-60 px-10 py-6 text-base text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
        />
      </MobileFilterSection>

      <MobileFilterSection id="events-mobile-event-type-filter" label={t('eventType')}>
        <EventTypeChips selectedType={localEventType} onSelectType={setLocalEventType} />
      </MobileFilterSection>
    </MobileFiltersModalWrapper>
  )
}
