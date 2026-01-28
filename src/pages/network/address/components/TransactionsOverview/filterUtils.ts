import { isValidAddressFormat } from '@app/utils'
import type {
  AddressFilter,
  AddressFilterMode,
  TransactionDirection,
  TransactionFilters
} from '../../hooks/useLatestTransactions'

// ============================================================================
// ERROR PARSING UTILITIES
// ============================================================================

export type ParsedApiError = {
  messageKey: string
  address?: string
}

/**
 * Extracts error message string from RTK Query error object.
 * RTK Query FetchBaseQueryError has data property with the response body.
 */
export function extractErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (typeof error === 'object' && 'data' in error) {
    const { data } = error as { data: unknown }
    if (typeof data === 'string') return data
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return String((data as { message: unknown }).message)
    }
  }
  return String(error)
}

/**
 * Parses API error messages and returns a translation key with optional address.
 * Handles errors like:
 * - "invalid filter: invalid source filter: invalid identity [ADDRESS]"
 * - "invalid filter: invalid destination filter: invalid identity [ADDRESS]"
 * - "invalid filter: invalid source-exclude filter: invalid identity [ADDRESS]"
 * - "invalid filter: invalid destination-exclude filter: invalid identity [ADDRESS]"
 */
export function parseFilterApiError(error: string | null): ParsedApiError | null {
  if (!error) return null

  // Match pattern: invalid (source|destination)[-exclude]? filter: invalid identity [ADDRESS]
  const match = error.match(
    /invalid (source|destination)(?:-exclude)? filter: invalid identity \[([A-Z]+)\]/
  )

  if (match) {
    const [, filterType, address] = match
    const messageKey =
      filterType === 'source' ? 'invalidSourceIdentity' : 'invalidDestinationIdentity'
    return { messageKey, address }
  }

  // Fallback for unknown errors
  return null
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export type ValidationError = string | null

/**
 * Validates addresses and returns per-field errors.
 * Returns an array of error message keys (or null for valid fields).
 * Also returns whether any validation error exists.
 */
export function validateAddresses(addresses: string[]): {
  errors: (string | null)[]
  hasError: boolean
} {
  const errors: (string | null)[] = []
  let hasError = false

  // Track seen addresses to detect duplicates (case-insensitive)
  const seenAddresses = new Map<string, number>()

  addresses.forEach((addr, index) => {
    const trimmed = addr.trim()
    if (trimmed === '') {
      errors[index] = null
      return
    }

    // Check format validity
    if (!isValidAddressFormat(trimmed)) {
      errors[index] = 'invalidAddressFormat'
      hasError = true
      return
    }

    // Check for duplicates
    const upperAddr = trimmed.toUpperCase()
    if (seenAddresses.has(upperAddr)) {
      errors[index] = 'duplicateAddress'
      hasError = true
    } else {
      seenAddresses.set(upperAddr, index)
      errors[index] = null
    }
  })

  return { errors, hasError }
}

/**
 * Validates an address filter for format errors and duplicates.
 * Returns an error message key or null if valid.
 */
export function validateAddressFilter(filter: AddressFilter | undefined): ValidationError {
  if (!filter?.addresses) return null

  const nonEmptyAddresses = filter.addresses.filter((addr) => addr.trim() !== '')
  if (nonEmptyAddresses.length === 0) return null

  const { errors, hasError } = validateAddresses(filter.addresses)
  if (!hasError) return null

  // Return the first error found
  return errors.find((e) => e !== null) ?? null
}

/**
 * Validates a numeric range filter (amount, inputType, tick).
 * @param start - Start value
 * @param end - End value
 * @param strictComparison - If true, start must be < end (not <=)
 * Returns an error message key or null if valid.
 */
function validateNumericRange(
  start: string | undefined,
  end: string | undefined,
  strictComparison = false
): ValidationError {
  if (!start || !end) return null

  const startNum = Number(start)
  const endNum = Number(end)
  const isInvalid = strictComparison ? startNum >= endNum : startNum > endNum

  return isInvalid ? 'invalid' : null
}

// Maximum value for uint32 fields (inputType, tick)
export const MAX_UINT32 = 2 ** 32 - 1

// Maximum value for uint64 fields (amount)
// Using BigInt for accurate comparison with large values
export const MAX_UINT64 = 2n ** 64n - 1n

/**
 * Validates an amount range filter.
 * Checks both range validity and maximum value constraint (uint64 max).
 * Returns translation key directly for simpler error handling in components.
 */
export function validateAmountRange(
  start: string | undefined,
  end: string | undefined
): ValidationError {
  // First check for max value overflow using BigInt for precision
  try {
    if (start && start.trim() !== '') {
      const startBigInt = BigInt(start)
      if (startBigInt > MAX_UINT64) return 'minAmountTooLarge'
    }
    if (end && end.trim() !== '') {
      const endBigInt = BigInt(end)
      if (endBigInt > MAX_UINT64) return 'maxAmountTooLarge'
    }
  } catch {
    // If BigInt parsing fails, let it through - the server will validate
  }

  // Check range validity - return final translation key
  const rangeError = validateNumericRange(start, end)
  return rangeError ? 'invalidRangeAmount' : null
}

/**
 * Validates an inputType range filter.
 * Checks both range validity and maximum value constraint (uint32 max).
 * Returns translation key directly for simpler error handling in components.
 */
export function validateInputTypeRange(
  start: string | undefined,
  end: string | undefined
): ValidationError {
  // First check for max value overflow
  if (start) {
    const startNum = Number(start)
    if (startNum > MAX_UINT32) return 'minInputTypeTooLarge'
  }
  if (end) {
    const endNum = Number(end)
    if (endNum > MAX_UINT32) return 'maxInputTypeTooLarge'
  }

  // Check range validity - return final translation key
  const rangeError = validateNumericRange(start, end)
  return rangeError ? 'invalidRangeInputType' : null
}

/**
 * Validates a tick number range filter.
 * Checks both range validity (strict: start < end) and maximum value constraint (uint32 max).
 * Returns translation key directly for simpler error handling in components.
 */
export function validateTickRange(
  start: string | undefined,
  end: string | undefined
): ValidationError {
  // First check for max value overflow (tick is uint32, same as inputType)
  if (start) {
    const startNum = Number(start)
    if (startNum > MAX_UINT32) return 'startTickTooLarge'
  }
  if (end) {
    const endNum = Number(end)
    if (endNum > MAX_UINT32) return 'endTickTooLarge'
  }

  // Check range validity with strict comparison (start must be < end)
  const rangeError = validateNumericRange(start, end, true)
  return rangeError ? 'invalidTickRange' : null
}

/**
 * Validates a date range filter.
 * Returns an error message key or null if valid.
 */
export function validateDateRange(
  start: string | undefined,
  end: string | undefined
): ValidationError {
  if (!start || !end) return null

  const startDate = new Date(start)
  const endDate = new Date(end)

  return startDate > endDate ? 'invalidDateRange' : null
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

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

export const MODE = {
  INCLUDE: 'include',
  EXCLUDE: 'exclude'
} as const satisfies Record<string, AddressFilterMode>

export const DIRECTION_OPTIONS: { value: TransactionDirection | undefined; labelKey: string }[] = [
  { value: undefined, labelKey: 'directionAll' },
  { value: DIRECTION.INCOMING, labelKey: 'directionIncoming' },
  { value: DIRECTION.OUTGOING, labelKey: 'directionOutgoing' }
]

/**
 * Helper to check if an address filter contains only the page address
 */
function isOnlyPageAddress(filter: AddressFilter | undefined, addressId: string): boolean {
  if (!filter) return false
  const validAddresses = filter.addresses.filter((addr) => addr.trim() !== '')
  return validAddresses.length === 1 && validAddresses[0] === addressId
}

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
 * Updates filters when direction changes, syncing source/destination accordingly.
 */
export function applyDirectionChange(
  filters: TransactionFilters,
  direction: TransactionDirection | undefined,
  addressId: string
): TransactionFilters {
  const newFilters = { ...filters, direction }

  if (direction === DIRECTION.INCOMING) {
    // Set destination filter with page address (include mode)
    newFilters.destinationFilter = { mode: MODE.INCLUDE, addresses: [addressId] }
    // Clear source filter if it only contains the page address
    if (isOnlyPageAddress(newFilters.sourceFilter, addressId)) {
      newFilters.sourceFilter = undefined
    }
  } else if (direction === DIRECTION.OUTGOING) {
    // Set source filter with page address (include mode)
    newFilters.sourceFilter = { mode: MODE.INCLUDE, addresses: [addressId] }
    // Clear destination filter if it only contains the page address
    if (isOnlyPageAddress(newFilters.destinationFilter, addressId)) {
      newFilters.destinationFilter = undefined
    }
  } else {
    // "All" - clear filters if they only contain the page address
    if (isOnlyPageAddress(newFilters.sourceFilter, addressId)) {
      newFilters.sourceFilter = undefined
    }
    if (isOnlyPageAddress(newFilters.destinationFilter, addressId)) {
      newFilters.destinationFilter = undefined
    }
  }

  return newFilters
}

/**
 * Updates filters when source filter changes (multi-address version).
 * Auto-syncs direction only when the filter contains ONLY the page address.
 */
export function applySourceFilterChange(
  filters: TransactionFilters,
  sourceFilter: AddressFilter | undefined,
  addressId: string
): TransactionFilters {
  const newFilters = { ...filters, sourceFilter }

  const validAddresses = sourceFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []

  // Auto-select direction when source filter contains ONLY the page address (include mode)
  if (
    validAddresses.length === 1 &&
    validAddresses[0] === addressId &&
    sourceFilter?.mode === MODE.INCLUDE &&
    filters.direction !== DIRECTION.OUTGOING
  ) {
    newFilters.direction = DIRECTION.OUTGOING
    // Clear destination filter if it only contains the page address
    if (isOnlyPageAddress(filters.destinationFilter, addressId)) {
      newFilters.destinationFilter = undefined
    }
  }

  // Clear direction when source filter is cleared/emptied and was previously outgoing
  // due to page address
  if (
    validAddresses.length === 0 &&
    isOnlyPageAddress(filters.sourceFilter, addressId) &&
    filters.direction === DIRECTION.OUTGOING
  ) {
    newFilters.direction = undefined
  }

  // Clear direction when mode changes to "exclude" while having page address
  // (direction should only be auto-selected for "include" mode)
  if (
    validAddresses.length === 1 &&
    validAddresses[0] === addressId &&
    sourceFilter?.mode === MODE.EXCLUDE &&
    filters.direction === DIRECTION.OUTGOING
  ) {
    newFilters.direction = undefined
  }

  // Clear direction when more addresses are added beyond just the page address
  // (direction should only be auto-selected for single page address)
  if (validAddresses.length > 1 && filters.direction === DIRECTION.OUTGOING) {
    newFilters.direction = undefined
  }

  return newFilters
}

/**
 * Updates filters when destination filter changes (multi-address version).
 * Auto-syncs direction only when the filter contains ONLY the page address.
 */
export function applyDestinationFilterChange(
  filters: TransactionFilters,
  destinationFilter: AddressFilter | undefined,
  addressId: string
): TransactionFilters {
  const newFilters = { ...filters, destinationFilter }

  const validAddresses = destinationFilter?.addresses.filter((addr) => addr.trim() !== '') ?? []

  // Auto-select direction when destination filter contains ONLY the page address (include mode)
  if (
    validAddresses.length === 1 &&
    validAddresses[0] === addressId &&
    destinationFilter?.mode === MODE.INCLUDE &&
    filters.direction !== DIRECTION.INCOMING
  ) {
    newFilters.direction = DIRECTION.INCOMING
    // Clear source filter if it only contains the page address
    if (isOnlyPageAddress(filters.sourceFilter, addressId)) {
      newFilters.sourceFilter = undefined
    }
  }

  // Clear direction when destination filter is cleared/emptied and was previously incoming
  // due to page address
  if (
    validAddresses.length === 0 &&
    isOnlyPageAddress(filters.destinationFilter, addressId) &&
    filters.direction === DIRECTION.INCOMING
  ) {
    newFilters.direction = undefined
  }

  // Clear direction when mode changes to "exclude" while having page address
  // (direction should only be auto-selected for "include" mode)
  if (
    validAddresses.length === 1 &&
    validAddresses[0] === addressId &&
    destinationFilter?.mode === MODE.EXCLUDE &&
    filters.direction === DIRECTION.INCOMING
  ) {
    newFilters.direction = undefined
  }

  // Clear direction when more addresses are added beyond just the page address
  // (direction should only be auto-selected for single page address)
  if (validAddresses.length > 1 && filters.direction === DIRECTION.INCOMING) {
    newFilters.direction = undefined
  }

  return newFilters
}
