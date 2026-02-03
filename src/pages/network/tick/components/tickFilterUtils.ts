import type { GetTransactionsForTickRequest } from '@app/store/apis/query-service/query-service.types'
import { buildRangeFilter } from '../../utils/filterUtils'

// Re-export shared utilities from network utils (only what's actually used by tick page)
export {
  AMOUNT_PRESETS,
  extractErrorMessage,
  formatAddressShort,
  formatAmountShort,
  parseFilterApiError,
  validateAmountRange,
  validateInputTypeRange,
  validateSingleAddress as validateAddress
} from '../../utils/filterUtils'

// Tick page uses simple single-address filters (no multi-address, no include/exclude mode)
// because getTransactionsForTick API only supports single source/destination
export interface TickTransactionFilters {
  source?: string
  destination?: string
  amountRange?: {
    start?: string
    end?: string
    presetKey?: string
  }
  inputTypeRange?: {
    start?: string
    end?: string
  }
}

/**
 * Builds the API request object from tick number and filters.
 * Note: Tick API only supports single source/destination addresses.
 */
export function buildTickTransactionsRequest(
  tickNumber: number,
  filters: TickTransactionFilters
): GetTransactionsForTickRequest {
  const request: GetTransactionsForTickRequest = { tickNumber }

  const cleanFilters: Record<string, string> = {}

  // Build source filter (single address)
  if (filters.source && filters.source.trim() !== '') {
    cleanFilters.source = filters.source.trim()
  }

  // Build destination filter (single address)
  if (filters.destination && filters.destination.trim() !== '') {
    cleanFilters.destination = filters.destination.trim()
  }

  // Handle amount - exact match or range
  const amountResult = buildRangeFilter(filters.amountRange?.start, filters.amountRange?.end)
  if (amountResult.exactMatch) {
    cleanFilters.amount = amountResult.exactMatch
  }

  // Handle inputType - exact match or range
  const inputTypeResult = buildRangeFilter(
    filters.inputTypeRange?.start,
    filters.inputTypeRange?.end
  )
  if (inputTypeResult.exactMatch) {
    cleanFilters.inputType = inputTypeResult.exactMatch
  }

  // Add filters to request if any
  if (Object.keys(cleanFilters).length > 0) {
    request.filters = cleanFilters
  }

  // Build ranges
  const ranges: GetTransactionsForTickRequest['ranges'] = {}

  if (amountResult.range) {
    ranges.amount = amountResult.range
  }

  if (inputTypeResult.range) {
    ranges.inputType = inputTypeResult.range
  }

  // Add ranges to request if any
  if (Object.keys(ranges).length > 0) {
    request.ranges = ranges
  }

  return request
}

/**
 * Checks if any filters are active.
 */
export function hasActiveFilters(filters: TickTransactionFilters): boolean {
  const hasSourceFilter = !!filters.source?.trim()
  const hasDestinationFilter = !!filters.destination?.trim()
  const hasAmountFilter = !!(filters.amountRange?.start || filters.amountRange?.end)
  const hasInputTypeFilter = !!(filters.inputTypeRange?.start || filters.inputTypeRange?.end)

  return hasSourceFilter || hasDestinationFilter || hasAmountFilter || hasInputTypeFilter
}
