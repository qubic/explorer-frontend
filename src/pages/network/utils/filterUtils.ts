import { isValidAddressFormat } from '@app/utils'
import type { Range } from '@app/store/apis/query-service/query-service.types'

// ============================================================================
// SHARED FORMATTING UTILITIES
// ============================================================================

/**
 * Formats an address for display by showing first 4 and last 4 characters.
 */
export function formatAddressShort(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

/**
 * Validates a single address input.
 * Returns an error message key or null if valid.
 */
export function validateSingleAddress(address: string | undefined): string | null {
  if (!address || address.trim() === '') return null

  if (!isValidAddressFormat(address.trim())) {
    return 'invalidAddressFormat'
  }

  return null
}

// ============================================================================
// FILTER BUILDING UTILITIES
// ============================================================================

/**
 * Builds a range object for API request.
 * If start equals end, returns exact match value instead of range.
 * @returns { exactMatch?: string, range?: Range }
 */
export function buildRangeFilter(
  start: string | undefined,
  end: string | undefined
): { exactMatch?: string; range?: Range } {
  const trimmedStart = start?.trim()
  const trimmedEnd = end?.trim()

  // If both are same non-empty value, return exact match
  if (trimmedStart && trimmedEnd && trimmedStart === trimmedEnd) {
    return { exactMatch: trimmedStart }
  }

  // Build range if any value present
  if (trimmedStart || trimmedEnd) {
    const range: Range = {}
    if (trimmedStart) range.gte = trimmedStart
    if (trimmedEnd) range.lte = trimmedEnd
    return { range }
  }

  return {}
}

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

// Maximum value for uint32 fields (inputType, tick)
export const MAX_UINT32 = 2 ** 32 - 1

// Maximum value for uint64 fields (amount)
// Using BigInt for accurate comparison with large values
export const MAX_UINT64 = 2n ** 64n - 1n

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

// ============================================================================
// AMOUNT FORMATTING UTILITIES
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

// ============================================================================
// PRESETS
// ============================================================================

export const AMOUNT_PRESETS = [
  { labelKey: 'amountOver0', start: '1', end: undefined },
  { labelKey: 'amount1to1M', start: '1', end: '1000000' },
  { labelKey: 'amount1Mto100M', start: '1000000', end: '100000000' },
  { labelKey: 'amount100Mto1B', start: '100000000', end: '1000000000' },
  { labelKey: 'amount1Bto10B', start: '1000000000', end: '10000000000' },
  { labelKey: 'amountOver10B', start: '10000000000', end: undefined }
]
