import { isValidAddressFormat } from '@app/utils'
import { MAX_UINT32 } from '../../../utils/filterUtils'

// Re-export shared utilities from network utils (only what's actually used by address page)
export {
  AMOUNT_PRESETS,
  extractErrorMessage,
  formatAddressShort,
  formatAmountForDisplay,
  formatAmountShort,
  parseAmountFromDisplay,
  parseFilterApiError,
  validateAmountRange,
  validateInputTypeRange
} from '../../../utils/filterUtils'
export type { ParsedApiError, TranslationFn, ValidationError } from '../../../utils/filterUtils'

// ============================================================================
// ADDRESS PAGE FILTER TYPES
// ============================================================================

export type AddressFilterMode = 'include' | 'exclude'

export interface AddressFilter {
  mode: AddressFilterMode
  addresses: string[]
}

export type TransactionDirection = 'incoming' | 'outgoing'

export interface TxTypeFilter {
  scAddress?: string
  scLabel: string
  procedureId?: number
  procedureName?: string
  isStandard?: boolean
}

export interface TransactionFilters {
  txType?: TxTypeFilter
  direction?: TransactionDirection
  sourceFilter?: AddressFilter
  destinationFilter?: AddressFilter
  amount?: string
  inputType?: string
  tickNumber?: string
  amountRange?: {
    start?: string
    end?: string
    presetKey?: string
  }
  inputTypeRange?: {
    start?: string
    end?: string
  }
  tickNumberRange?: {
    start?: string
    end?: string
  }
  dateRange?: {
    start?: string
    end?: string
    presetDays?: number
  }
}

// ============================================================================
// ADDRESS PAGE FILTER BUILDING UTILITIES
// ============================================================================

/**
 * Builds source filter for API request from AddressFilter object.
 * Returns object with either 'source' or 'source-exclude' key.
 */
export function buildSourceFilter(filter: AddressFilter | undefined): Record<string, string> {
  if (!filter?.addresses || filter.addresses.length === 0) return {}
  const validAddresses = filter.addresses.filter((addr) => addr.trim() !== '')
  if (validAddresses.length === 0) return {}

  const commaSeparated = validAddresses.join(',')
  return filter.mode === 'exclude'
    ? { 'source-exclude': commaSeparated }
    : { source: commaSeparated }
}

/**
 * Builds destination filter for API request from AddressFilter object.
 * Returns object with either 'destination' or 'destination-exclude' key.
 */
export function buildDestinationFilter(filter: AddressFilter | undefined): Record<string, string> {
  if (!filter?.addresses || filter.addresses.length === 0) return {}
  const validAddresses = filter.addresses.filter((addr) => addr.trim() !== '')
  if (validAddresses.length === 0) return {}

  const commaSeparated = validAddresses.join(',')
  return filter.mode === 'exclude'
    ? { 'destination-exclude': commaSeparated }
    : { destination: commaSeparated }
}

// ============================================================================
// ADDRESS PAGE VALIDATION UTILITIES
// ============================================================================

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
export function validateAddressFilter(filter: AddressFilter | undefined): string | null {
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
): string | null {
  if (!start || !end) return null

  const startNum = Number(start)
  const endNum = Number(end)
  const isInvalid = strictComparison ? startNum >= endNum : startNum > endNum

  return isInvalid ? 'invalid' : null
}

/**
 * Validates a tick number range filter.
 * Checks both range validity (start <= end) and maximum value constraint (uint32 max).
 * Returns translation key directly for simpler error handling in components.
 */
export function validateTickRange(
  start: string | undefined,
  end: string | undefined
): string | null {
  // First check for max value overflow (tick is uint32, same as inputType)
  if (start) {
    const startNum = Number(start)
    if (startNum > MAX_UINT32) return 'startTickTooLarge'
  }
  if (end) {
    const endNum = Number(end)
    if (endNum > MAX_UINT32) return 'endTickTooLarge'
  }

  // Check range validity (start <= end, allows exact tick match)
  const rangeError = validateNumericRange(start, end)
  return rangeError ? 'invalidTickRange' : null
}

/**
 * Validates a date range filter.
 * Returns an error message key or null if valid.
 */
export function validateDateRange(
  start: string | undefined,
  end: string | undefined
): string | null {
  if (!start || !end) return null

  const startDate = new Date(start)
  const endDate = new Date(end)

  return startDate > endDate ? 'invalidDateRange' : null
}

// ============================================================================
// ADDRESS PAGE DATE UTILITIES
// ============================================================================

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

// ============================================================================
// ADDRESS PAGE CONSTANTS
// ============================================================================

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

export const DATE_PRESETS = [
  { labelKey: 'dateLastHour', days: 1 / 24 },
  { labelKey: 'dateLast24Hours', days: 1 },
  { labelKey: 'dateLastNDays', days: 7, daysCount: 7 },
  { labelKey: 'dateLastNDays', days: 30, daysCount: 30 },
  { labelKey: 'dateLastNDays', days: 90, daysCount: 90 },
  { labelKey: 'dateLastNDays', days: 180, daysCount: 180 }
]

// ============================================================================
// ADDRESS PAGE FILTER CHANGE HANDLERS
// ============================================================================

/**
 * Helper to check if an address filter contains only the page address
 */
function isOnlyPageAddress(filter: AddressFilter | undefined, addressId: string): boolean {
  if (!filter) return false
  const validAddresses = filter.addresses.filter((addr) => addr.trim() !== '')
  return validAddresses.length === 1 && validAddresses[0] === addressId
}

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
