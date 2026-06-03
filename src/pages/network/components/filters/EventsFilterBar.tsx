import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FunnelIcon } from '@app/assets/icons'
import { getCategoryLabel, getEventTypeLabel } from '@app/store/apis/events'
import type {
  AddressFilter,
  TransactionDirection
} from '../../address/components/TransactionsOverview/filterUtils'
import DirectionControl from '../../address/components/TransactionsOverview/DirectionControl'
import DateFilterContent from '../../address/components/TransactionsOverview/DateFilterContent'
import MultiAddressFilterContent from '../../address/components/TransactionsOverview/MultiAddressFilterContent'
import { formatRangeLabel } from '../../hooks'
import type { EventFiltersResult } from '../../hooks/useEventFilters'
import type { DateRangeValue, EventAmountFilter } from '../../utils/eventFilterUtils'
import { getAddressFilterLabel, getDateRangeLabel } from '../../utils/eventFilterUtils'
import { formatAmountForDisplay } from '../../utils/filterUtils'
import ActiveFilterChip from './ActiveFilterChip'
import CategorySelect from './CategorySelect'
import EventAmountFilterContent from './EventAmountFilterContent'
import EventsMobileFiltersModal, { type EventsFilters } from './EventsMobileFiltersModal'
import EventTypeChips from './EventTypeChips'
import FilterDropdown from './FilterDropdown'
import MobileFiltersButton from './MobileFiltersButton'
import RangeFilterContent from './RangeFilterContent'
import ResetFiltersButton from './ResetFiltersButton'

type Props = {
  filters: EventFiltersResult
  eventTypes: number[]
  category?: number
  direction?: TransactionDirection | undefined
  tickStart?: string
  tickEnd?: string
  epochStart?: string
  epochEnd?: string
  dateRange?: DateRangeValue
  sourceFilter?: AddressFilter
  destinationFilter?: AddressFilter
  amountFilter?: EventAmountFilter
  idPrefix: string
  showTickFilter?: boolean
  showEpochFilter?: boolean
  showDateFilter?: boolean
  showDirectionFilter?: boolean
  showCategoryFilter?: boolean
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
  category,
  direction,
  tickStart,
  tickEnd,
  epochStart,
  epochEnd,
  dateRange,
  sourceFilter,
  destinationFilter,
  amountFilter,
  idPrefix,
  showTickFilter = true,
  showEpochFilter = false,
  showDateFilter = true,
  showDirectionFilter = false,
  showCategoryFilter = false,
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
  const epochLabel = showEpochFilter
    ? formatRangeLabel(
        t('epoch'),
        epochStart || epochEnd ? { start: epochStart, end: epochEnd } : undefined,
        formatAmountForDisplay
      )
    : ''
  const eventTypeLabel = getEventTypesLabel(eventTypes, t('eventType'))
  const categoryLabel =
    category !== undefined ? `${t('category')}: ${getCategoryLabel(category)}` : t('category')
  const dateLabel = showDateFilter ? getDateRangeLabel(dateRange, t) : ''
  const sourceLabel = getAddressFilterLabel('source', sourceFilter, t)
  const destLabel = getAddressFilterLabel('destination', destinationFilter, t)

  const handleToggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key))
  }

  const amountLabel = formatRangeLabel(
    t('amount'),
    amountFilter ? { start: amountFilter.min, end: amountFilter.max } : undefined,
    formatAmountForDisplay
  )

  const mobileActiveFilters: EventsFilters = {
    eventTypes,
    direction,
    sourceFilter,
    destinationFilter,
    amountFilter: filters.localAmountFilter,
    ...(showCategoryFilter && { category }),
    ...(showTickFilter && {
      tickRange: tickStart || tickEnd ? { start: tickStart, end: tickEnd } : undefined
    }),
    ...(showEpochFilter && {
      epochRange: epochStart || epochEnd ? { start: epochStart, end: epochEnd } : undefined
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
            {showCategoryFilter && filters.isCategoryActive && category !== undefined && (
              <ActiveFilterChip
                label={`${t('category')}: ${getCategoryLabel(category)}`}
                onClear={filters.handleClearCategory}
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
            {filters.isAmountActive && (
              <ActiveFilterChip label={amountLabel} onClear={filters.handleClearAmount} />
            )}
            {showTickFilter && filters.isTickActive && (
              <ActiveFilterChip label={tickLabel} onClear={filters.handleClearTick} />
            )}
            {showEpochFilter && filters.isEpochActive && (
              <ActiveFilterChip label={epochLabel} onClear={filters.handleClearEpoch} />
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
        showEpochFilter={showEpochFilter}
        showDateFilter={showDateFilter}
        showDirectionFilter={showDirectionFilter}
        showCategoryFilter={showCategoryFilter}
        addressId={addressId}
      />

      {/* Desktop: Dropdown filters */}
      <div className="hidden flex-wrap items-center gap-8 sm:flex">
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
                if (filters.handleDateRangeApply()) setOpenDropdown(null)
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
                if (filters.handleTickRangeApply()) setOpenDropdown(null)
              }}
              startLabel={t('startTick')}
              endLabel={t('endTick')}
              error={filters.tickRangeError ? t(filters.tickRangeError) : null}
              formatDisplay={false}
            />
          </FilterDropdown>
        )}
        {showEpochFilter && (
          <FilterDropdown
            label={epochLabel}
            isActive={filters.isEpochActive}
            show={openDropdown === 'epoch'}
            onToggle={() => handleToggleDropdown('epoch')}
            onClear={filters.isEpochActive ? filters.handleClearEpoch : undefined}
          >
            <RangeFilterContent
              idPrefix={`${idPrefix}-epoch-range`}
              value={filters.epochRange}
              onChange={filters.handleEpochRangeChange}
              onApply={() => {
                if (filters.handleEpochRangeApply()) setOpenDropdown(null)
              }}
              startLabel={t('startEpoch')}
              endLabel={t('endEpoch')}
              error={filters.epochRangeError ? t(filters.epochRangeError) : null}
              formatDisplay={false}
            />
          </FilterDropdown>
        )}
        {showCategoryFilter && (
          <FilterDropdown
            label={categoryLabel}
            isActive={filters.isCategoryActive}
            show={openDropdown === 'category'}
            onToggle={() => handleToggleDropdown('category')}
            onClear={filters.isCategoryActive ? filters.handleClearCategory : undefined}
          >
            <CategorySelect
              value={category}
              onChange={(next) => {
                filters.handleCategoryChange(next)
                setOpenDropdown(null)
              }}
            />
          </FilterDropdown>
        )}
        <FilterDropdown
          label={amountLabel}
          isActive={filters.isAmountActive}
          show={openDropdown === 'amount'}
          onToggle={() => handleToggleDropdown('amount')}
          onClear={filters.isAmountActive ? filters.handleClearAmount : undefined}
          contentClassName="min-w-[280px]"
          allowFullWidth
        >
          <EventAmountFilterContent
            idPrefix={`${idPrefix}-amount`}
            value={filters.localAmountFilter}
            onChange={filters.handleAmountChange}
            onApply={() => {
              if (filters.handleAmountApply()) setOpenDropdown(null)
            }}
            error={filters.amountFilterError ? t(filters.amountFilterError) : null}
          />
        </FilterDropdown>
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
