import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FunnelIcon } from '@app/assets/icons'
import { getEventTypeLabel } from '@app/store/apis/events'
import type {
  AddressFilter,
  TransactionDirection
} from '../../address/components/TransactionsOverview/filterUtils'
import DirectionControl from '../../address/components/TransactionsOverview/DirectionControl'
import DateFilterContent from '../../address/components/TransactionsOverview/DateFilterContent'
import MultiAddressFilterContent from '../../address/components/TransactionsOverview/MultiAddressFilterContent'
import { formatRangeLabel } from '../../hooks'
import type { EventFiltersResult } from '../../hooks/useEventFilters'
import type { DateRangeValue } from '../../utils/eventFilterUtils'
import { getAddressFilterLabel, getDateRangeLabel } from '../../utils/eventFilterUtils'
import { formatAmountForDisplay } from '../../utils/filterUtils'
import ActiveFilterChip from './ActiveFilterChip'
import EventsMobileFiltersModal, { type EventsFilters } from './EventsMobileFiltersModal'
import EventTypeChips from './EventTypeChips'
import FilterDropdown from './FilterDropdown'
import MobileFiltersButton from './MobileFiltersButton'
import RangeFilterContent from './RangeFilterContent'
import ResetFiltersButton from './ResetFiltersButton'

type Props = {
  filters: EventFiltersResult
  eventTypes: number[]
  direction?: TransactionDirection | undefined
  tickStart?: string
  tickEnd?: string
  dateRange?: DateRangeValue
  sourceFilter?: AddressFilter
  destinationFilter?: AddressFilter
  idPrefix: string
  showTickFilter?: boolean
  showDateFilter?: boolean
  showDirectionFilter?: boolean
  addressId?: string
}

function getEventTypesLabel(eventTypes: number[], fallback: string): string {
  if (eventTypes.length === 0) return fallback
  if (eventTypes.length === 1) return getEventTypeLabel(eventTypes[0])
  return `${getEventTypeLabel(eventTypes[0])} +${eventTypes.length - 1}`
}

export default function EventsFilterBar({
  filters,
  eventTypes,
  direction,
  tickStart,
  tickEnd,
  dateRange,
  sourceFilter,
  destinationFilter,
  idPrefix,
  showTickFilter = true,
  showDateFilter = true,
  showDirectionFilter = false,
  addressId
}: Props) {
  const { t } = useTranslation('network-page')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)

  const tickLabel = showTickFilter
    ? formatRangeLabel(
        t('tick'),
        tickStart || tickEnd ? { start: tickStart, end: tickEnd } : undefined,
        formatAmountForDisplay
      )
    : ''
  const eventTypeLabel = getEventTypesLabel(eventTypes, t('eventType'))
  const dateLabel = showDateFilter ? getDateRangeLabel(dateRange, t) : ''
  const sourceLabel = getAddressFilterLabel('source', sourceFilter, t)
  const destLabel = getAddressFilterLabel('destination', destinationFilter, t)

  const handleToggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key))
  }

  const mobileActiveFilters: EventsFilters = {
    eventTypes,
    direction,
    sourceFilter,
    destinationFilter,
    ...(showTickFilter && {
      tickRange: tickStart || tickEnd ? { start: tickStart, end: tickEnd } : undefined
    }),
    ...(showDateFilter && { dateRange })
  }

  return (
    <>
      {/* Mobile: Filters button + active filter chips */}
      <div className="flex flex-col gap-10 sm:hidden">
        <div className="flex items-center justify-end">
          <MobileFiltersButton onClick={() => setIsMobileModalOpen(true)} />
        </div>

        {filters.hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-6">
            {eventTypes.length > 0 && (
              <ActiveFilterChip
                label={`${t('eventType')}: ${eventTypes.map(getEventTypeLabel).join(', ')}`}
                onClear={filters.handleClearEventType}
              />
            )}
            {filters.isSourceActive && (
              <ActiveFilterChip label={sourceLabel} onClear={filters.handleClearSource} />
            )}
            {filters.isDestActive && (
              <ActiveFilterChip label={destLabel} onClear={filters.handleClearDest} />
            )}
            {showDateFilter && filters.isDateActive && (
              <ActiveFilterChip label={dateLabel} onClear={filters.handleClearDate} />
            )}
            {showTickFilter && filters.isTickActive && (
              <ActiveFilterChip label={tickLabel} onClear={filters.handleClearTick} />
            )}
            <ResetFiltersButton onClick={filters.handleClearAll} />
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      <EventsMobileFiltersModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        activeFilters={mobileActiveFilters}
        onApplyFilters={filters.handleMobileApplyFilters}
        idPrefix={idPrefix}
        showTickFilter={showTickFilter}
        showDateFilter={showDateFilter}
        showDirectionFilter={showDirectionFilter}
        addressId={addressId}
      />

      {/* Desktop: Dropdown filters */}
      <div className="hidden items-center gap-8 sm:flex">
        <FunnelIcon className="h-16 w-16 text-gray-50" />
        {showDirectionFilter && (
          <DirectionControl
            value={direction}
            onChange={filters.handleDirectionChange}
            showTooltips
          />
        )}
        <FilterDropdown
          label={eventTypeLabel}
          isActive={filters.isEventTypeActive}
          show={openDropdown === 'eventType'}
          onToggle={() => handleToggleDropdown('eventType')}
          onClear={filters.isEventTypeActive ? filters.handleClearEventType : undefined}
        >
          <EventTypeChips
            selectedTypes={eventTypes}
            onToggle={filters.handleToggleEventType}
            className="p-8"
          />
        </FilterDropdown>
        <FilterDropdown
          label={sourceLabel}
          isActive={filters.isSourceActive}
          show={openDropdown === 'source'}
          onToggle={() => handleToggleDropdown('source')}
          onClear={filters.isSourceActive ? filters.handleClearSource : undefined}
        >
          <MultiAddressFilterContent
            id={`${idPrefix}-source-filter`}
            value={filters.localSourceFilter}
            onChange={filters.setLocalSourceFilter}
            onApply={() => {
              filters.handleSourceApply()
              setOpenDropdown(null)
            }}
          />
        </FilterDropdown>
        <FilterDropdown
          label={destLabel}
          isActive={filters.isDestActive}
          show={openDropdown === 'destination'}
          onToggle={() => handleToggleDropdown('destination')}
          onClear={filters.isDestActive ? filters.handleClearDest : undefined}
        >
          <MultiAddressFilterContent
            id={`${idPrefix}-dest-filter`}
            value={filters.localDestFilter}
            onChange={filters.setLocalDestFilter}
            onApply={() => {
              filters.handleDestApply()
              setOpenDropdown(null)
            }}
          />
        </FilterDropdown>
        {showDateFilter && (
          <FilterDropdown
            label={dateLabel}
            isActive={filters.isDateActive}
            show={openDropdown === 'date'}
            onToggle={() => handleToggleDropdown('date')}
            onClear={filters.isDateActive ? filters.handleClearDate : undefined}
            contentClassName="min-w-[280px]"
            allowFullWidth
          >
            <DateFilterContent
              idPrefix={`${idPrefix}-date`}
              value={filters.localDateRange}
              onChange={filters.handleDateRangeChange}
              onApply={() => {
                filters.handleDateRangeApply()
                setOpenDropdown(null)
              }}
              onPresetSelect={(days) => {
                filters.handleDatePresetSelect(days)
                setOpenDropdown(null)
              }}
              selectedPresetDays={dateRange?.presetDays}
              error={filters.dateRangeError ? t(filters.dateRangeError) : null}
            />
          </FilterDropdown>
        )}
        {showTickFilter && (
          <FilterDropdown
            label={tickLabel}
            isActive={filters.isTickActive}
            show={openDropdown === 'tick'}
            onToggle={() => handleToggleDropdown('tick')}
            onClear={filters.isTickActive ? filters.handleClearTick : undefined}
          >
            <RangeFilterContent
              idPrefix={`${idPrefix}-tick-range`}
              value={filters.tickRange}
              onChange={filters.handleTickRangeChange}
              onApply={() => {
                filters.handleTickRangeApply()
                setOpenDropdown(null)
              }}
              startLabel={t('startTick')}
              endLabel={t('endTick')}
              error={filters.tickRangeError ? t(filters.tickRangeError) : null}
              formatDisplay={false}
            />
          </FilterDropdown>
        )}
        {filters.hasActiveFilters && (
          <>
            <div className="grow" />
            <ResetFiltersButton onClick={filters.handleClearAll} showTooltip />
          </>
        )}
      </div>
    </>
  )
}
