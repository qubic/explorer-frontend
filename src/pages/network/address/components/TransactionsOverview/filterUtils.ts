import type { TransactionDirection, TransactionFilters } from '../../hooks/useLatestTransactions'

// Format a number string with thousand separators for display
export function formatAmountForDisplay(value: string | undefined): string {
  if (!value) return ''
  const num = Number(value)
  if (Number.isNaN(num)) return value
  return num.toLocaleString('en-US')
}

// Format a number with K/M/B notation for chip labels (only for round numbers)
export type TranslationFn = (key: string) => string

export function formatAmountShort(value: string | undefined, t: TranslationFn): string {
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
export function parseAmountFromDisplay(formatted: string): string {
  // Remove all non-digit characters except for leading minus
  return formatted.replace(/[^\d]/g, '')
}

// Calculate start date from preset days
export function getStartDateFromDays(days: number | undefined): string | undefined {
  if (!days) return undefined
  const now = new Date()
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  // Keep the actual time for presets (don't reset to midnight)
  // This ensures "Last hour" and "Last 24 hours" are always different
  // Format to datetime-local format with seconds: YYYY-MM-DDTHH:mm:ss
  const year = start.getFullYear()
  const month = String(start.getMonth() + 1).padStart(2, '0')
  const day = String(start.getDate()).padStart(2, '0')
  const hours = String(start.getHours()).padStart(2, '0')
  const minutes = String(start.getMinutes()).padStart(2, '0')
  const seconds = String(start.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export const DIRECTION = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing'
} as const satisfies Record<string, TransactionDirection>

export const DIRECTION_OPTIONS: { value: TransactionDirection | undefined; labelKey: string }[] = [
  { value: undefined, labelKey: 'directionAll' },
  { value: DIRECTION.INCOMING, labelKey: 'directionIncoming' },
  { value: DIRECTION.OUTGOING, labelKey: 'directionOutgoing' }
]

export const AMOUNT_PRESETS = [
  { labelKey: 'amountOver0', start: '1', end: undefined },
  { labelKey: 'amount1to1M', start: '1', end: '1000000' },
  { labelKey: 'amount1Mto100M', start: '1000000', end: '100000000' },
  { labelKey: 'amount100Mto1B', start: '100000000', end: '1000000000' },
  { labelKey: 'amount1Bto10B', start: '1000000000', end: '10000000000' },
  { labelKey: 'amountOver10B', start: '10000000000', end: undefined }
]

export const DATE_PRESETS = [
  { labelKey: 'dateLastHour', days: 1 / 24 },
  { labelKey: 'dateLast24Hours', days: 1 },
  { labelKey: 'dateLastNDays', days: 7, daysCount: 7 },
  { labelKey: 'dateLastNDays', days: 30, daysCount: 30 },
  { labelKey: 'dateLastNDays', days: 90, daysCount: 90 },
  { labelKey: 'dateLastNDays', days: 180, daysCount: 180 }
]

/**
 * Calculates start date from presetDays if a date preset is selected.
 * This ensures consistent date calculation timing across desktop and mobile.
 */
export function applyDatePresetCalculation(filters: TransactionFilters): TransactionFilters {
  if (filters.dateRange?.presetDays !== undefined) {
    const startDate = getStartDateFromDays(filters.dateRange.presetDays)
    return {
      ...filters,
      dateRange: {
        start: startDate,
        end: undefined,
        presetDays: filters.dateRange.presetDays
      }
    }
  }
  return filters
}

/**
 * Updates filters when direction changes, syncing source/destination accordingly
 */
export function applyDirectionChange(
  filters: TransactionFilters,
  direction: TransactionDirection | undefined,
  addressId: string
): TransactionFilters {
  const newFilters = { ...filters, direction }

  if (direction === DIRECTION.INCOMING) {
    newFilters.destination = addressId
    if (newFilters.source === addressId) {
      newFilters.source = undefined
    }
  } else if (direction === DIRECTION.OUTGOING) {
    newFilters.source = addressId
    if (newFilters.destination === addressId) {
      newFilters.destination = undefined
    }
  } else {
    // "All" - clear both if they match addressId
    if (newFilters.source === addressId) {
      newFilters.source = undefined
    }
    if (newFilters.destination === addressId) {
      newFilters.destination = undefined
    }
  }

  return newFilters
}

/**
 * Updates filters when source changes, auto-syncing direction if needed
 */
export function applySourceChange(
  filters: TransactionFilters,
  source: string | undefined,
  addressId: string
): TransactionFilters {
  const newFilters = { ...filters, source }

  // Auto-select direction when source matches addressId
  if (source === addressId && filters.direction !== DIRECTION.OUTGOING) {
    newFilters.direction = DIRECTION.OUTGOING
    if (filters.destination === addressId) {
      newFilters.destination = undefined
    }
  }

  // Clear direction when source is cleared and it was previously addressId (outgoing)
  if (!source && filters.source === addressId && filters.direction === DIRECTION.OUTGOING) {
    newFilters.direction = undefined
  }

  return newFilters
}

/**
 * Updates filters when destination changes, auto-syncing direction if needed
 */
export function applyDestinationChange(
  filters: TransactionFilters,
  destination: string | undefined,
  addressId: string
): TransactionFilters {
  const newFilters = { ...filters, destination }

  // Auto-select direction when destination matches addressId
  if (destination === addressId && filters.direction !== DIRECTION.INCOMING) {
    newFilters.direction = DIRECTION.INCOMING
    if (filters.source === addressId) {
      newFilters.source = undefined
    }
  }

  // Clear direction when destination is cleared and it was previously addressId (incoming)
  if (
    !destination &&
    filters.destination === addressId &&
    filters.direction === DIRECTION.INCOMING
  ) {
    newFilters.direction = undefined
  }

  return newFilters
}
