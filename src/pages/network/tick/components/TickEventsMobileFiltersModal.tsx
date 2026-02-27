import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useBodyScrollLock } from '@app/hooks'
import {
  EventTypeChips,
  MobileFiltersModalWrapper,
  MobileFilterSection
} from '../../components/filters'

type Props = {
  isOpen: boolean
  onClose: () => void
  activeEventType: number | undefined
  onApply: (eventType: number | undefined) => void
}

export default function TickEventsMobileFiltersModal({
  isOpen,
  onClose,
  activeEventType,
  onApply
}: Props) {
  const { t } = useTranslation('network-page')

  useBodyScrollLock(isOpen)

  const [localEventType, setLocalEventType] = useState(activeEventType)

  useEffect(() => {
    if (isOpen) {
      setLocalEventType(activeEventType)
    }
  }, [isOpen, activeEventType])

  const handleApply = useCallback(() => {
    onApply(localEventType)
    onClose()
  }, [localEventType, onApply, onClose])

  return (
    <MobileFiltersModalWrapper
      id="tick-events-mobile-filters-modal"
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
    >
      <MobileFilterSection id="tick-events-mobile-event-type-filter" label={t('eventType')}>
        <EventTypeChips selectedType={localEventType} onSelectType={setLocalEventType} />
      </MobileFilterSection>
    </MobileFiltersModalWrapper>
  )
}
