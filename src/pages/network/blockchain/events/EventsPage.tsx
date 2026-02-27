import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FunnelIcon } from '@app/assets/icons'
import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { getEventTypeLabel } from '@app/store/apis/events'
import { HomeLink } from '../../components'
import BetaBanner from '../../components/BetaBanner'
import {
  ActiveFilterChip,
  EventTypeDropdownList,
  FilterDropdown,
  MobileFiltersButton,
  ResetFiltersButton
} from '../../components/filters'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import EventsMobileFiltersModal from './EventsMobileFiltersModal'
import useEventsPage from './useEventsPage'
import useEventsPageFilters from './useEventsPageFilters'

function EventsPage() {
  const { t } = useTranslation('network-page')
  const { events, total, eventType, tick, isLoading } = useEventsPage()

  const {
    tickInput,
    setTickInput,
    isTickActive,
    isEventTypeActive,
    hasActiveFilters,
    handleTickApply,
    handleTickKeyDown,
    handleClearTick,
    handleSelectEventType,
    handleClearEventType,
    handleClearAll,
    handleMobileApplyFilters
  } = useEventsPageFilters(tick, eventType)

  const [showTickDropdown, setShowTickDropdown] = useState(false)
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)

  const tickLabel = isTickActive ? String(tick) : t('tick')
  const eventTypeLabel = eventType !== undefined ? getEventTypeLabel(eventType) : t('eventType')

  return (
    <PageLayout>
      <div className="flex flex-col gap-20">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <p className="text-xs text-gray-50">{t('blockchain')}</p>
          <p className="text-xs text-primary-30">{t('events')}</p>
        </Breadcrumbs>

        <p className="font-space text-24 font-500">{t('events')}</p>

        <BetaBanner />

        {/* Mobile: Filters button + active filter chips */}
        <div className="flex flex-col gap-10 sm:hidden">
          <div className="flex items-center justify-end">
            <MobileFiltersButton onClick={() => setIsMobileModalOpen(true)} />
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-6">
              {isTickActive && (
                <ActiveFilterChip label={`${t('tick')}: ${tick}`} onClear={handleClearTick} />
              )}
              {eventType !== undefined && (
                <ActiveFilterChip
                  label={`${t('eventType')}: ${getEventTypeLabel(eventType)}`}
                  onClear={handleClearEventType}
                />
              )}
              <ResetFiltersButton onClick={handleClearAll} />
            </div>
          )}
        </div>

        {/* Mobile Modal */}
        <EventsMobileFiltersModal
          isOpen={isMobileModalOpen}
          onClose={() => setIsMobileModalOpen(false)}
          activeFilters={{ tick: tick !== undefined ? String(tick) : undefined, eventType }}
          onApplyFilters={handleMobileApplyFilters}
        />

        {/* Desktop: Dropdown filters */}
        <div className="hidden items-center gap-8 sm:flex">
          <FunnelIcon className="h-16 w-16 text-gray-50" />
          <FilterDropdown
            label={tickLabel}
            isActive={isTickActive}
            show={showTickDropdown}
            onToggle={() => setShowTickDropdown((prev) => !prev)}
            onClear={isTickActive ? handleClearTick : undefined}
          >
            <div className="flex flex-col gap-8">
              <input
                type="text"
                inputMode="numeric"
                value={tickInput}
                onChange={(e) => setTickInput(e.target.value)}
                onKeyDown={handleTickKeyDown}
                placeholder={t('tick')}
                className="w-full rounded border border-primary-60 bg-primary-70 px-10 py-8 font-space text-xs text-white placeholder:text-gray-50 focus:border-primary-30 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleTickApply}
                className="mt-4 w-full rounded bg-primary-30 px-12 py-8 text-xs font-medium text-primary-80 hover:bg-primary-40"
              >
                {t('filterButton')}
              </button>
            </div>
          </FilterDropdown>
          <FilterDropdown
            label={eventTypeLabel}
            isActive={isEventTypeActive}
            show={showEventTypeDropdown}
            onToggle={() => setShowEventTypeDropdown((prev) => !prev)}
            onClear={isEventTypeActive ? handleClearEventType : undefined}
          >
            <EventTypeDropdownList onSelect={handleSelectEventType} />
          </FilterDropdown>
          {hasActiveFilters && (
            <>
              <div className="grow" />
              <ResetFiltersButton onClick={handleClearAll} showTooltip />
            </>
          )}
        </div>

        <TransactionEvents
          events={events}
          total={total}
          isLoading={isLoading}
          paginated
          showTxId
          showTickAndTimestamp
          showBetaBanner={false}
        />
      </div>
    </PageLayout>
  )
}

const EventsPageWithHelmet = withHelmet(EventsPage, {
  title: 'Events | Qubic Explorer',
  meta: [{ name: 'description', content: 'Browse blockchain events on the Qubic Network' }]
})

export default EventsPageWithHelmet
