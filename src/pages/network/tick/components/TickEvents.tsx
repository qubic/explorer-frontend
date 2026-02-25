import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FunnelIcon } from '@app/assets/icons'
import { Alert } from '@app/components/ui'
import { getEventTypeLabel } from '@app/store/apis/events'
import BetaBanner from '../../components/BetaBanner'
import {
  ActiveFilterChip,
  EventTypeDropdownList,
  FilterDropdown,
  MobileFiltersButton,
  ResetFiltersButton
} from '../../components/filters'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useTickEvents, useTickEventsFilters } from '../hooks'
import TickEventsMobileFiltersModal from './TickEventsMobileFiltersModal'

type Props = Readonly<{
  tick: number
}>

export default function TickEvents({ tick }: Props) {
  const { t } = useTranslation('network-page')
  const { events, total, eventType, isLoading, hasError } = useTickEvents(tick)
  const { isActive, handleSelect, handleClear, handleMobileApply } = useTickEventsFilters(eventType)

  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)

  const label = eventType !== undefined ? getEventTypeLabel(eventType) : t('eventType')

  return (
    <div className="flex flex-col gap-16">
      <BetaBanner />

      {/* Mobile: Filters button + active filter chips */}
      <div className="flex flex-col gap-10 sm:hidden">
        <div className="flex items-center justify-end">
          <MobileFiltersButton onClick={() => setIsMobileModalOpen(true)} />
        </div>

        {eventType !== undefined && (
          <div className="flex flex-wrap items-center gap-6">
            <ActiveFilterChip
              label={`${t('eventType')}: ${getEventTypeLabel(eventType)}`}
              onClear={handleClear}
            />
            <ResetFiltersButton onClick={handleClear} />
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      <TickEventsMobileFiltersModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        activeEventType={eventType}
        onApply={handleMobileApply}
      />

      {/* Desktop: Dropdown filter */}
      <div className="hidden items-center gap-8 sm:flex">
        <FunnelIcon className="h-16 w-16 text-gray-50" />
        <FilterDropdown
          label={label}
          isActive={isActive}
          show={showDropdown}
          onToggle={() => setShowDropdown((prev) => !prev)}
          onClear={isActive ? handleClear : undefined}
        >
          <EventTypeDropdownList onSelect={handleSelect} />
        </FilterDropdown>
        {isActive && (
          <>
            <div className="grow" />
            <ResetFiltersButton onClick={handleClear} showTooltip />
          </>
        )}
      </div>

      {hasError ? (
        <Alert variant="error">{t('eventsLoadFailed')}</Alert>
      ) : (
        <TransactionEvents
          events={events}
          total={total}
          isLoading={isLoading}
          paginated
          showBetaBanner={false}
        />
      )}
    </div>
  )
}
