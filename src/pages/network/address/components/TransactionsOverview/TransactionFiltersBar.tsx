import { ChevronDownIcon, XmarkIcon } from '@app/assets/icons'
import DropdownMenu from '@app/components/ui/DropdownMenu'
import Tooltip from '@app/components/ui/Tooltip'
import { clsxTwMerge } from '@app/utils'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'

// Format a number string with thousand separators for display
function formatAmountForDisplay(value: string | undefined): string {
  if (!value) return ''
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return num.toLocaleString('en-US')
}

// Format a number with K/M/B notation for chip labels (only for round numbers)
type TranslationFn = (key: string) => string
function formatAmountShort(value: string | undefined, t: TranslationFn): string {
  if (!value) return ''
  const num = Number(value)
  if (Number.isNaN(num)) return value

  const billion = 1_000_000_000
  const million = 1_000_000
  const thousand = 1_000

  // Check if it's a round number divisible by the unit
  if (num >= billion && num % billion === 0) {
    return `${num / billion}${t('billionShort')}`
  }
  if (num >= million && num % million === 0) {
    return `${num / million}${t('millionShort')}`
  }
  if (num >= thousand && num % thousand === 0) {
    return `${num / thousand}${t('thousandShort')}`
  }

  // Fall back to regular formatting for non-round numbers
  return num.toLocaleString('en-US')
}

// Parse a formatted string back to raw number string
function parseAmountFromDisplay(formatted: string): string {
  // Remove all non-digit characters except for leading minus
  return formatted.replace(/[^\d]/g, '')
}

type Props = {
  activeFilters: TransactionFilters
  onApplyFilters: (filters: TransactionFilters) => void
  onClearFilters: () => void
}

type FilterDropdownProps = {
  label: string
  isActive: boolean
  children: React.ReactNode
  show: boolean
  onToggle: () => void
  onClear?: () => void
  contentClassName?: string
}

type DropdownAlignment = 'left' | 'center' | 'right'

function FilterDropdown({
  label,
  isActive,
  children,
  show,
  onToggle,
  onClear,
  contentClassName
}: FilterDropdownProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [alignment, setAlignment] = useState<DropdownAlignment>('left')
  const [isPositioned, setIsPositioned] = useState(false)

  // Calculate optimal alignment after dropdown renders
  useLayoutEffect(() => {
    if (!show) {
      setIsPositioned(false)
      return undefined
    }

    // Use requestAnimationFrame to ensure DOM has been laid out
    const rafId = requestAnimationFrame(() => {
      if (!wrapperRef.current || !triggerRef.current) return

      // Query for the dropdown content element inside the wrapper
      const contentEl = wrapperRef.current.querySelector('[role="menu"]') as HTMLElement
      if (!contentEl) return

      const buttonRect = triggerRef.current.getBoundingClientRect()
      const contentWidth = contentEl.offsetWidth
      const viewportWidth = window.innerWidth
      const margin = 16

      // Calculate where dropdown would be with left alignment
      const leftAlignedRight = buttonRect.left + contentWidth
      // Calculate where dropdown would be with right alignment
      const rightAlignedLeft = buttonRect.right - contentWidth

      // Check if left alignment would overflow right edge
      const wouldOverflowRight = leftAlignedRight > viewportWidth - margin
      // Check if right alignment would overflow left edge
      const wouldOverflowLeft = rightAlignedLeft < margin

      if (wouldOverflowRight && !wouldOverflowLeft) {
        setAlignment('right')
      } else if (!wouldOverflowRight) {
        setAlignment('left')
      } else {
        // Both overflow - center it
        setAlignment('center')
      }

      setIsPositioned(true)
    })

    return () => cancelAnimationFrame(rafId)
  }, [show])

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear?.()
    // Close the dropdown after clearing
    if (show) {
      onToggle()
    }
  }

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'right':
        return 'ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto'
      case 'center':
        return 'ltr:left-1/2 ltr:right-auto ltr:-translate-x-1/2 rtl:right-1/2 rtl:left-auto rtl:translate-x-1/2'
      default:
        return 'ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto'
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <DropdownMenu show={show} onToggle={onToggle}>
        <DropdownMenu.Trigger className="flex items-center gap-4">
          <button
            ref={triggerRef}
            type="button"
            className={clsxTwMerge(
              'flex shrink-0 items-center gap-4 rounded border px-8 py-6 text-xs transition-colors sm:gap-6 sm:px-10',
              isActive
                ? 'border-primary-30 bg-primary-60 text-primary-30'
                : 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
            )}
          >
            <span className="max-w-[120px] truncate sm:max-w-[200px]">{label}</span>
            {isActive && onClear ? (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClearClick}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleClearClick(e as unknown as React.MouseEvent)
                }
                className="flex items-center justify-center rounded-full p-2 hover:bg-primary-50"
                aria-label="Clear filter"
              >
                <XmarkIcon className="h-10 w-10" />
              </span>
            ) : (
              <ChevronDownIcon
                className={clsxTwMerge('h-12 w-12 transition-transform', show && 'rotate-180')}
              />
            )}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className={clsxTwMerge(
            'min-w-[200px] max-w-[calc(100vw-32px)] p-12 transition-none',
            getAlignmentClasses(),
            !isPositioned && 'invisible',
            contentClassName
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  )
}

const AMOUNT_PRESETS = [
  { labelKey: 'amount1to1M', start: '1', end: '1000000' },
  { labelKey: 'amount1Mto100M', start: '1000000', end: '100000000' },
  { labelKey: 'amount100Mto1B', start: '100000000', end: '1000000000' },
  { labelKey: 'amount1Bto10B', start: '1000000000', end: '10000000000' },
  { labelKey: 'amountOver10B', start: '10000000000', end: undefined }
]

const DATE_PRESETS = [
  { labelKey: 'dateLastHour', days: 1 / 24 },
  { labelKey: 'dateLast24Hours', days: 1 },
  { labelKey: 'dateLastNDays', days: 7, daysCount: 7 },
  { labelKey: 'dateLastNDays', days: 30, daysCount: 30 },
  { labelKey: 'dateLastNDays', days: 90, daysCount: 90 },
  { labelKey: 'dateLastNDays', days: 180, daysCount: 180 }
]

function getStartDateFromDays(days: number | undefined): string | undefined {
  if (!days) return undefined
  const now = new Date()
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  // Format to datetime-local format: YYYY-MM-DDTHH:mm
  const year = start.getFullYear()
  const month = String(start.getMonth() + 1).padStart(2, '0')
  const day = String(start.getDate()).padStart(2, '0')
  const hours = String(start.getHours()).padStart(2, '0')
  const minutes = String(start.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function TransactionFiltersBar({
  activeFilters,
  onApplyFilters,
  onClearFilters
}: Props) {
  const { t } = useTranslation('network-page')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const [localFilters, setLocalFilters] = useState<TransactionFilters>(activeFilters)
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({})

  const handleToggle = useCallback(
    (dropdown: string) => {
      setOpenDropdown((prev) => {
        if (prev === dropdown) {
          // Closing dropdown - clear its validation error and reset local filters
          setValidationErrors((errors) => ({ ...errors, [dropdown]: null }))
          setLocalFilters(activeFilters)
          return null
        }
        // Opening dropdown - sync local filters with active filters
        setLocalFilters(activeFilters)
        return dropdown
      })
    },
    [activeFilters]
  )

  const handleApplyFilter = useCallback(
    (filterKey: keyof TransactionFilters, value: TransactionFilters[keyof TransactionFilters]) => {
      const newFilters = { ...activeFilters, [filterKey]: value }
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown(null)
    },
    [activeFilters, onApplyFilters]
  )

  const handleApplyRangeFilter = useCallback(
    (
      filterKey: 'amountRange' | 'tickNumberRange' | 'dateRange',
      start: string | undefined,
      end: string | undefined
    ) => {
      // Determine dropdown key for error state
      let dropdownKey: string
      if (filterKey === 'amountRange') {
        dropdownKey = 'amount'
      } else if (filterKey === 'tickNumberRange') {
        dropdownKey = 'tick'
      } else {
        dropdownKey = 'date'
      }

      // Validate range before applying
      let error: string | null = null
      if (start && end) {
        if (filterKey === 'dateRange') {
          // Date validation
          const startDate = new Date(start)
          const endDate = new Date(end)
          if (startDate > endDate) {
            error = t('invalidRange')
          }
        } else {
          // Numeric validation
          const startNum = Number(start)
          const endNum = Number(end)
          if (startNum > endNum) {
            error = t('invalidRangeAmount')
          }
        }
      }

      if (error) {
        setValidationErrors((prev) => ({ ...prev, [dropdownKey]: error }))
        return
      }

      // Clear any validation error
      setValidationErrors((prev) => ({ ...prev, [dropdownKey]: null }))

      const newFilters = {
        ...activeFilters,
        [filterKey]: start || end ? { start, end } : undefined
      }
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown(null)
    },
    [activeFilters, onApplyFilters, t]
  )

  const hasActiveFilters = Object.entries(activeFilters).some(([key, value]) => {
    if (['tickNumberRange', 'dateRange', 'amountRange'].includes(key)) {
      return value && (value.start || value.end)
    }
    return key !== 'amount' && typeof value === 'string' && value.trim() !== ''
  })

  const isSourceActive = !!activeFilters.source
  const isDestinationActive = !!activeFilters.destination
  const isAmountActive = !!(activeFilters.amountRange?.start || activeFilters.amountRange?.end)
  const isDateActive = !!(activeFilters.dateRange?.start || activeFilters.dateRange?.end)
  const isTickActive = !!(
    activeFilters.tickNumberRange?.start || activeFilters.tickNumberRange?.end
  )

  // Get display labels for active filters
  const getSourceLabel = () => {
    if (!isSourceActive) return t('source')
    return `${t('source')}: ${activeFilters.source?.slice(0, 8)}...`
  }

  const getDestinationLabel = () => {
    if (!isDestinationActive) return t('destination')
    return `${t('destination')}: ${activeFilters.destination?.slice(0, 8)}...`
  }

  const getAmountLabel = () => {
    if (!isAmountActive) return t('amount')
    // Check if it matches a preset
    const preset = AMOUNT_PRESETS.find(
      (p) =>
        p.start === activeFilters.amountRange?.start && p.end === activeFilters.amountRange?.end
    )
    if (preset) return `${t('amount')}: ${t(preset.labelKey)}`
    const { start, end } = activeFilters.amountRange || {}
    if (start && end)
      return `${t('amount')}: ${formatAmountShort(start, t)} - ${formatAmountShort(end, t)}`
    if (start) return `${t('amount')}: ≥ ${formatAmountShort(start, t)}`
    if (end) return `${t('amount')}: ≤ ${formatAmountShort(end, t)}`
    return t('amount')
  }

  const getDateLabel = () => {
    if (!isDateActive) return t('date')
    // Check if it matches a preset (approximate check based on days difference)
    const { start, end } = activeFilters.dateRange || {}
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      const preset = DATE_PRESETS.find((p) => p.days === daysDiff)
      if (preset) {
        const presetLabel = preset.daysCount
          ? t(preset.labelKey, { count: preset.daysCount })
          : t(preset.labelKey)
        return `${t('date')}: ${presetLabel}`
      }
      return `${t('date')}: ${t('customRange')}`
    }
    return `${t('date')}: ${t('customRange')}`
  }

  const getTickLabel = () => {
    if (!isTickActive) return t('tick')
    const { start, end } = activeFilters.tickNumberRange || {}
    if (start && end)
      return `${t('tick')}: ${formatAmountForDisplay(start)} - ${formatAmountForDisplay(end)}`
    if (start) return `${t('tick')}: ≥ ${formatAmountForDisplay(start)}`
    if (end) return `${t('tick')}: ≤ ${formatAmountForDisplay(end)}`
    return t('tick')
  }

  // Clear handlers for individual filters
  const clearSourceFilter = useCallback(() => {
    const newFilters = { ...activeFilters, source: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  const clearDestinationFilter = useCallback(() => {
    const newFilters = { ...activeFilters, destination: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  const clearAmountFilter = useCallback(() => {
    const newFilters = { ...activeFilters, amountRange: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  const clearDateFilter = useCallback(() => {
    const newFilters = { ...activeFilters, dateRange: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  const clearTickFilter = useCallback(() => {
    const newFilters = { ...activeFilters, tickNumberRange: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters])

  return (
    <div className="mb-16 flex flex-wrap items-center justify-start gap-6 sm:gap-8">
      {/* Clear All Filters Chip */}
      {hasActiveFilters && (
        <Tooltip tooltipId="clear-all-filters" content={t('clearAllFiltersTooltip')}>
          <button
            type="button"
            onClick={() => {
              onClearFilters()
              setLocalFilters({})
            }}
            className="flex shrink-0 items-center gap-4 rounded border border-primary-30 bg-primary-60 px-8 py-6 text-xs text-primary-30 transition-colors sm:gap-6 sm:px-10"
          >
            <span className="max-w-[120px] truncate sm:max-w-[200px]">{t('clearAllFilters')}</span>
            <span className="flex items-center justify-center rounded-full p-2 hover:bg-primary-50">
              <XmarkIcon className="h-10 w-10" />
            </span>
          </button>
        </Tooltip>
      )}

      {/* Source Filter */}
      <FilterDropdown
        label={getSourceLabel()}
        isActive={isSourceActive}
        show={openDropdown === 'source'}
        onToggle={() => handleToggle('source')}
        onClear={isSourceActive ? clearSourceFilter : undefined}
        contentClassName="w-[280px] sm:min-w-[420px]"
      >
        <div className="space-y-10">
          <div>
            <label htmlFor="filter-source" className="mb-4 block text-xs text-gray-50">
              {t('source')}
            </label>
            <input
              id="filter-source"
              type="text"
              value={localFilters.source || ''}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, source: e.target.value }))}
              placeholder={t('addressPlaceholder')}
              className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
            />
          </div>
          <button
            type="button"
            onClick={() => handleApplyFilter('source', localFilters.source)}
            className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
          >
            {t('filterButton')}
          </button>
        </div>
      </FilterDropdown>

      {/* Destination Filter */}
      <FilterDropdown
        label={getDestinationLabel()}
        isActive={isDestinationActive}
        show={openDropdown === 'destination'}
        onToggle={() => handleToggle('destination')}
        onClear={isDestinationActive ? clearDestinationFilter : undefined}
        contentClassName="w-[280px] sm:min-w-[420px]"
      >
        <div className="space-y-10">
          <div>
            <label htmlFor="filter-destination" className="mb-4 block text-xs text-gray-50">
              {t('destination')}*
            </label>
            <input
              id="filter-destination"
              type="text"
              value={localFilters.destination || ''}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, destination: e.target.value }))
              }
              placeholder={t('addressPlaceholder')}
              className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
            />
            <p className="mt-6 text-xs italic text-gray-50">*{t('destinationFilterHint')}</p>
          </div>
          <button
            type="button"
            onClick={() => handleApplyFilter('destination', localFilters.destination)}
            className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
          >
            {t('filterButton')}
          </button>
        </div>
      </FilterDropdown>

      {/* Amount Filter */}
      <FilterDropdown
        label={getAmountLabel()}
        isActive={isAmountActive}
        show={openDropdown === 'amount'}
        onToggle={() => handleToggle('amount')}
        onClear={isAmountActive ? clearAmountFilter : undefined}
        contentClassName="min-w-[200px]"
      >
        <div className="space-y-8">
          {/* Preset chips */}
          <div className="flex flex-wrap gap-6">
            {AMOUNT_PRESETS.map((preset) => {
              const isSelected =
                localFilters.amountRange?.start === preset.start &&
                localFilters.amountRange?.end === preset.end
              return (
                <button
                  key={preset.labelKey}
                  type="button"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      amountRange: { start: preset.start, end: preset.end }
                    }))
                  }
                  className={clsxTwMerge(
                    'rounded-full border px-8 py-4 text-xs transition-colors',
                    isSelected
                      ? 'border-primary-30 bg-primary-60 text-primary-30'
                      : 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
                  )}
                >
                  {t(preset.labelKey)}
                </button>
              )
            })}
          </div>
          {/* Amount inputs */}
          <div className="space-y-8">
            <div>
              <label htmlFor="filter-amount-min" className="mb-4 block text-xs text-gray-50">
                {t('minAmount')}
              </label>
              <input
                id="filter-amount-min"
                type="text"
                inputMode="numeric"
                value={formatAmountForDisplay(localFilters.amountRange?.start)}
                onChange={(e) => {
                  const rawValue = parseAmountFromDisplay(e.target.value)
                  setLocalFilters((prev) => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, start: rawValue || undefined }
                  }))
                }}
                className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
              />
            </div>
            <div>
              <label htmlFor="filter-amount-max" className="mb-4 block text-xs text-gray-50">
                {t('maxAmount')}
              </label>
              <input
                id="filter-amount-max"
                type="text"
                inputMode="numeric"
                value={formatAmountForDisplay(localFilters.amountRange?.end)}
                onChange={(e) => {
                  const rawValue = parseAmountFromDisplay(e.target.value)
                  setLocalFilters((prev) => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, end: rawValue || undefined }
                  }))
                }}
                className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
              />
            </div>
            <p className="text-xs italic text-gray-50">*{t('amountFilterHint')}</p>
            {validationErrors.amount && (
              <p className="text-xs text-red-400">{validationErrors.amount}</p>
            )}
            <button
              type="button"
              onClick={() =>
                handleApplyRangeFilter(
                  'amountRange',
                  localFilters.amountRange?.start,
                  localFilters.amountRange?.end
                )
              }
              className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
            >
              {t('filterButton')}
            </button>
          </div>
        </div>
      </FilterDropdown>

      {/* Date Filter */}
      <FilterDropdown
        label={getDateLabel()}
        isActive={isDateActive}
        show={openDropdown === 'date'}
        onToggle={() => handleToggle('date')}
        onClear={isDateActive ? clearDateFilter : undefined}
        contentClassName="min-w-[280px]"
      >
        <div className="space-y-8">
          {/* Preset chips */}
          <div className="flex flex-wrap gap-6">
            {DATE_PRESETS.map((preset) => {
              const startDate = getStartDateFromDays(preset.days)
              const isSelected =
                localFilters.dateRange?.start === startDate && !localFilters.dateRange?.end
              return (
                <button
                  key={preset.labelKey}
                  type="button"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      dateRange: { start: startDate, end: undefined }
                    }))
                  }
                  className={clsxTwMerge(
                    'rounded-full border px-8 py-4 text-xs transition-colors',
                    isSelected
                      ? 'border-primary-30 bg-primary-60 text-primary-30'
                      : 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
                  )}
                >
                  {preset.daysCount
                    ? t(preset.labelKey, { count: preset.daysCount })
                    : t(preset.labelKey)}
                </button>
              )
            })}
          </div>
          {/* Date inputs */}
          <div className="space-y-8">
            <div>
              <label htmlFor="filter-date-start" className="mb-4 block text-xs text-gray-50">
                {t('startDate')}
              </label>
              <input
                id="filter-date-start"
                type="datetime-local"
                value={localFilters.dateRange?.start || ''}
                onChange={(e) => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))
                  e.target.blur()
                }}
                className={clsxTwMerge(
                  'w-full rounded bg-primary-60 px-10 py-6 text-xs focus:outline-none focus:ring-1 focus:ring-primary-30 [&::-webkit-calendar-picker-indicator]:invert',
                  localFilters.dateRange?.start
                    ? 'text-white [&::-webkit-calendar-picker-indicator]:opacity-100'
                    : 'text-gray-50 [&::-webkit-calendar-picker-indicator]:opacity-50'
                )}
              />
            </div>
            <div>
              <label htmlFor="filter-date-end" className="mb-4 block text-xs text-gray-50">
                {t('endDate')}
              </label>
              <input
                id="filter-date-end"
                type="datetime-local"
                value={localFilters.dateRange?.end || ''}
                onChange={(e) => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))
                  e.target.blur()
                }}
                className={clsxTwMerge(
                  'w-full rounded bg-primary-60 px-10 py-6 text-xs focus:outline-none focus:ring-1 focus:ring-primary-30 [&::-webkit-calendar-picker-indicator]:invert',
                  localFilters.dateRange?.end
                    ? 'text-white [&::-webkit-calendar-picker-indicator]:opacity-100'
                    : 'text-gray-50 [&::-webkit-calendar-picker-indicator]:opacity-50'
                )}
              />
            </div>
            {validationErrors.date && (
              <p className="text-xs text-red-400">{validationErrors.date}</p>
            )}
            <button
              type="button"
              onClick={() =>
                handleApplyRangeFilter(
                  'dateRange',
                  localFilters.dateRange?.start,
                  localFilters.dateRange?.end
                )
              }
              className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
            >
              {t('filterButton')}
            </button>
          </div>
        </div>
      </FilterDropdown>

      {/* Tick Filter */}
      <FilterDropdown
        label={getTickLabel()}
        isActive={isTickActive}
        show={openDropdown === 'tick'}
        onToggle={() => handleToggle('tick')}
        onClear={isTickActive ? clearTickFilter : undefined}
      >
        <div className="space-y-16">
          <div>
            <label htmlFor="filter-tick-start" className="mb-4 block text-xs text-gray-50">
              {t('startTick')}
            </label>
            <input
              id="filter-tick-start"
              type="text"
              inputMode="numeric"
              value={formatAmountForDisplay(localFilters.tickNumberRange?.start)}
              onChange={(e) => {
                const rawValue = parseAmountFromDisplay(e.target.value)
                setLocalFilters((prev) => ({
                  ...prev,
                  tickNumberRange: { ...prev.tickNumberRange, start: rawValue || undefined }
                }))
              }}
              className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
            />
          </div>
          <div>
            <label htmlFor="filter-tick-end" className="mb-4 block text-xs text-gray-50">
              {t('endTick')}
            </label>
            <input
              id="filter-tick-end"
              type="text"
              inputMode="numeric"
              value={formatAmountForDisplay(localFilters.tickNumberRange?.end)}
              onChange={(e) => {
                const rawValue = parseAmountFromDisplay(e.target.value)
                setLocalFilters((prev) => ({
                  ...prev,
                  tickNumberRange: { ...prev.tickNumberRange, end: rawValue || undefined }
                }))
              }}
              className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
            />
          </div>
          {validationErrors.tick && <p className="text-xs text-red-400">{validationErrors.tick}</p>}
          <button
            type="button"
            onClick={() =>
              handleApplyRangeFilter(
                'tickNumberRange',
                localFilters.tickNumberRange?.start,
                localFilters.tickNumberRange?.end
              )
            }
            className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
          >
            {t('filterButton')}
          </button>
        </div>
      </FilterDropdown>
    </div>
  )
}
