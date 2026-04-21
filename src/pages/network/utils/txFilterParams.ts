import { isValidAddressFormat } from '@app/utils'
import type {
  AddressFilter,
  TransactionFilters
} from '../address/components/TransactionsOverview/filterUtils'
import type { TickTransactionFilters } from '../tick/components/tickFilterUtils'
import { parseAddressFilter, parseDateRange, parseTickRange } from './eventFilterUtils'

// ============================================================================
// FILTER PARAM CLEARING (for tab switches)
// ============================================================================

/** Params that should persist across tab switches (not filter-related). */
const PRESERVED_PARAMS = new Set(['tab', 'pageSize'])

/**
 * Removes all filter-related search params from the given URLSearchParams.
 * Preserves `tab` and `pageSize` (user preferences, not filters).
 */
export function clearFilterParams(params: URLSearchParams): void {
  Array.from(params.keys()).forEach((key) => {
    if (!PRESERVED_PARAMS.has(key)) params.delete(key)
  })
}

// ============================================================================
// URL → TRANSACTION FILTERS (parsing)
// ============================================================================

/** Returns value only if it's a valid non-negative integer string. */
function parseNumericParam(value: string | null): string | undefined {
  if (!value) return undefined
  return /^\d+$/.test(value) ? value : undefined
}

/** Validates addresses in a parsed AddressFilter, keeping only valid-format ones. */
function validateAddressFilter(filter: AddressFilter | undefined): AddressFilter | undefined {
  if (!filter) return undefined
  const valid = filter.addresses.filter((addr) => isValidAddressFormat(addr))
  if (valid.length === 0) return undefined
  return { ...filter, addresses: valid }
}

/**
 * Parses amount range from URL search params.
 * Reads: amountMin, amountMax, amountPreset
 */
function parseTxAmountRange(
  searchParams: URLSearchParams
): TransactionFilters['amountRange'] | undefined {
  const min = parseNumericParam(searchParams.get('amountMin'))
  const max = parseNumericParam(searchParams.get('amountMax'))
  const presetKey = searchParams.get('amountPreset') || undefined
  if (!min && !max && !presetKey) return undefined
  return { start: min, end: max, presetKey }
}

/**
 * Parses input type range from URL search params.
 * Reads: inputTypeMin, inputTypeMax
 */
function parseTxInputTypeRange(
  searchParams: URLSearchParams
): TransactionFilters['inputTypeRange'] | undefined {
  const min = parseNumericParam(searchParams.get('inputTypeMin'))
  const max = parseNumericParam(searchParams.get('inputTypeMax'))
  if (!min && !max) return undefined
  return { start: min, end: max }
}

/**
 * Parses all address-page transaction filters from URL search params.
 */
export function parseTransactionFilters(searchParams: URLSearchParams): TransactionFilters {
  const direction = searchParams.get('direction') as TransactionFilters['direction'] | null
  const sourceFilter = validateAddressFilter(
    parseAddressFilter(searchParams, 'source', 'sourceMode')
  )
  const destinationFilter = validateAddressFilter(
    parseAddressFilter(searchParams, 'destination', 'destMode')
  )
  const amountRange = parseTxAmountRange(searchParams)
  const inputTypeRange = parseTxInputTypeRange(searchParams)
  const { start: tickStart, end: tickEnd } = parseTickRange(searchParams)
  const tickNumberRange = tickStart || tickEnd ? { start: tickStart, end: tickEnd } : undefined
  const dateRange = parseDateRange(searchParams)

  const filters: TransactionFilters = {}
  if (direction === 'incoming' || direction === 'outgoing') filters.direction = direction
  if (sourceFilter) filters.sourceFilter = sourceFilter
  if (destinationFilter) filters.destinationFilter = destinationFilter
  if (amountRange) filters.amountRange = amountRange
  if (inputTypeRange) filters.inputTypeRange = inputTypeRange
  if (tickNumberRange) filters.tickNumberRange = tickNumberRange
  if (dateRange) filters.dateRange = dateRange
  return filters
}

/**
 * Parses tick-page transaction filters from URL search params.
 * Tick page uses simpler single-address filters (no multi-address, no direction/date/tick range).
 */
export function parseTickTransactionFilters(searchParams: URLSearchParams): TickTransactionFilters {
  const rawSource = searchParams.get('source') || undefined
  const rawDest = searchParams.get('destination') || undefined
  const source = rawSource && isValidAddressFormat(rawSource) ? rawSource : undefined
  const destination = rawDest && isValidAddressFormat(rawDest) ? rawDest : undefined
  const amountRange = parseTxAmountRange(searchParams)
  const inputTypeRange = parseTxInputTypeRange(searchParams)

  const filters: TickTransactionFilters = {}
  if (source) filters.source = source
  if (destination) filters.destination = destination
  if (amountRange) filters.amountRange = amountRange
  if (inputTypeRange) filters.inputTypeRange = inputTypeRange
  return filters
}

// ============================================================================
// TRANSACTION FILTERS → URL PARAMS (serialization)
// ============================================================================

/**
 * Converts address-page transaction filters to URL param record.
 * Undefined values signal "remove this param".
 */
export function txFiltersToParams(filters: TransactionFilters): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {
    direction: filters.direction ?? undefined,
    // Source
    source: filters.sourceFilter?.addresses.filter((a) => a.trim()).join(',') || undefined,
    sourceMode:
      filters.sourceFilter?.addresses.some((a) => a.trim()) &&
      filters.sourceFilter?.mode === 'exclude'
        ? 'exclude'
        : undefined,
    // Destination
    destination:
      filters.destinationFilter?.addresses.filter((a) => a.trim()).join(',') || undefined,
    destMode:
      filters.destinationFilter?.addresses.some((a) => a.trim()) &&
      filters.destinationFilter?.mode === 'exclude'
        ? 'exclude'
        : undefined,
    // Amount
    amountMin: filters.amountRange?.start ?? undefined,
    amountMax: filters.amountRange?.end ?? undefined,
    amountPreset: filters.amountRange?.presetKey ?? undefined,
    // Input type
    inputTypeMin: filters.inputTypeRange?.start ?? undefined,
    inputTypeMax: filters.inputTypeRange?.end ?? undefined,
    // Tick range
    tickStart: filters.tickNumberRange?.start ?? undefined,
    tickEnd: filters.tickNumberRange?.end ?? undefined,
    // Date range
    dateStart: filters.dateRange?.start ?? undefined,
    dateEnd: filters.dateRange?.end ?? undefined,
    datePresetDays:
      filters.dateRange?.presetDays !== undefined ? String(filters.dateRange.presetDays) : undefined
  }
  return params
}

/**
 * Converts tick-page transaction filters to URL param record.
 */
export function tickTxFiltersToParams(
  filters: TickTransactionFilters
): Record<string, string | undefined> {
  return {
    source: filters.source?.trim() || undefined,
    destination: filters.destination?.trim() || undefined,
    amountMin: filters.amountRange?.start ?? undefined,
    amountMax: filters.amountRange?.end ?? undefined,
    amountPreset: filters.amountRange?.presetKey ?? undefined,
    inputTypeMin: filters.inputTypeRange?.start ?? undefined,
    inputTypeMax: filters.inputTypeRange?.end ?? undefined
  }
}
