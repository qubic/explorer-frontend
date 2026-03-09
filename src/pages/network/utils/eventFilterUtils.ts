import type { EventRange } from '@app/store/apis/events'
import type {
  AddressFilter,
  TransactionDirection
} from '../address/components/TransactionsOverview/filterUtils'
import {
  DATE_PRESETS,
  DIRECTION,
  getStartDateFromDays,
  isOnlyPageAddress,
  MODE
} from '../address/components/TransactionsOverview/filterUtils'
import { formatAddressShort } from './filterUtils'

// ============================================================================
// SHARED TYPES
// ============================================================================

export type TickRangeValue = { start?: string; end?: string }
export type DateRangeValue = { start?: string; end?: string; presetDays?: number }

export function toTickRangeValue(
  tickStart: string | undefined,
  tickEnd: string | undefined
): TickRangeValue | undefined {
  return tickStart || tickEnd ? { start: tickStart, end: tickEnd } : undefined
}

// ============================================================================
// URL PARAM PARSING
// ============================================================================

export function parseAddressFilter(
  searchParams: URLSearchParams,
  key: string,
  modeKey: string
): AddressFilter | undefined {
  const raw = searchParams.get(key)
  if (!raw) return undefined
  const addresses = raw
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
  if (addresses.length === 0) return undefined
  const mode = searchParams.get(modeKey) === MODE.EXCLUDE ? MODE.EXCLUDE : MODE.INCLUDE
  return { mode, addresses }
}

export function parseTickRange(searchParams: URLSearchParams): TickRangeValue {
  return {
    start: searchParams.get('tickStart') || undefined,
    end: searchParams.get('tickEnd') || undefined
  }
}

export function parseDateRange(searchParams: URLSearchParams): DateRangeValue | undefined {
  const presetRaw = searchParams.get('datePresetDays')
  if (presetRaw) {
    const presetDays = parseFloat(presetRaw)
    if (Number.isFinite(presetDays) && presetDays > 0) {
      return { presetDays }
    }
  }
  const start = searchParams.get('dateStart') || undefined
  const end = searchParams.get('dateEnd') || undefined
  if (start || end) return { start, end }
  return undefined
}

// ============================================================================
// API REQUEST BUILDING
// ============================================================================

export function buildEventAddressFilter(filter: AddressFilter | undefined): {
  include?: string
  exclude?: string
} {
  if (!filter?.addresses || filter.addresses.length === 0) return {}
  const validAddresses = filter.addresses.filter((addr) => addr.trim() !== '')
  if (validAddresses.length === 0) return {}
  const commaSeparated = validAddresses.join(',')
  return filter.mode === MODE.EXCLUDE ? { exclude: commaSeparated } : { include: commaSeparated }
}

export function buildTickFilter(
  tickStart: string | undefined,
  tickEnd: string | undefined
): { tickNumber?: number; tickRange?: EventRange } {
  if (!tickStart && !tickEnd) return {}
  if (tickStart && tickEnd && tickStart === tickEnd) {
    return { tickNumber: Number(tickStart) }
  }
  return {
    tickRange: {
      ...(tickStart && { gte: tickStart }),
      ...(tickEnd && { lte: tickEnd })
    }
  }
}

export function buildTimestampRange(dateRange: DateRangeValue | undefined): EventRange | undefined {
  if (!dateRange) return undefined

  const timestampStart =
    dateRange.presetDays !== undefined
      ? getStartDateFromDays(dateRange.presetDays)
      : dateRange.start

  if (!timestampStart && !dateRange.end) return undefined

  return {
    ...(timestampStart ? { gte: new Date(timestampStart).getTime().toString() } : {}),
    ...(dateRange.end ? { lte: new Date(dateRange.end).getTime().toString() } : {})
  }
}

// ============================================================================
// DIRECTION SYNC
// ============================================================================

/**
 * Computes new source/dest filters when direction changes.
 * Used by both the desktop direction handler and the mobile modal.
 */
export function applyEventDirectionSync(
  newDirection: TransactionDirection | undefined,
  addressId: string,
  currentSource: AddressFilter | undefined,
  currentDest: AddressFilter | undefined
): { sourceFilter: AddressFilter | undefined; destinationFilter: AddressFilter | undefined } {
  const isPageAddr = (filter: AddressFilter | undefined): boolean =>
    !!filter && filter.mode === MODE.INCLUDE && isOnlyPageAddress(filter, addressId)

  if (newDirection === DIRECTION.INCOMING) {
    return {
      sourceFilter: isPageAddr(currentSource) ? undefined : currentSource,
      destinationFilter: { mode: MODE.INCLUDE, addresses: [addressId] }
    }
  }
  if (newDirection === DIRECTION.OUTGOING) {
    return {
      sourceFilter: { mode: MODE.INCLUDE, addresses: [addressId] },
      destinationFilter: isPageAddr(currentDest) ? undefined : currentDest
    }
  }
  // "All" — clear page-address-only filters
  return {
    sourceFilter: isPageAddr(currentSource) ? undefined : currentSource,
    destinationFilter: isPageAddr(currentDest) ? undefined : currentDest
  }
}

// ============================================================================
// FILTER LABEL FORMATTING
// ============================================================================

type TranslationFn = (key: string, options?: Record<string, unknown>) => string

export function getAddressFilterLabel(
  filterName: string,
  filter: { mode: string; addresses: string[] } | undefined,
  t: TranslationFn
): string {
  if (!filter) return t(filterName)
  const validAddresses = filter.addresses.filter((addr) => addr.trim() !== '')
  if (validAddresses.length === 0) return t(filterName)
  const prefix = filter.mode === 'exclude' ? `${t('exclude')} ` : ''
  if (validAddresses.length === 1) {
    return `${t(filterName)}: ${prefix}${formatAddressShort(validAddresses[0])}`
  }
  return `${t(filterName)}: ${prefix}${validAddresses.length}`
}

function formatDateTimeShort(dateStr: string): string {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day}/${year} ${hours}:${minutes}`
}

export function getDateRangeLabel(dateRange: DateRangeValue | undefined, t: TranslationFn): string {
  if (!dateRange) return t('date')
  const { start, end, presetDays } = dateRange

  if (presetDays !== undefined) {
    const preset = DATE_PRESETS.find((p) => p.days === presetDays)
    if (preset) {
      const presetLabel = preset.daysCount
        ? t(preset.labelKey, { count: preset.daysCount })
        : t(preset.labelKey)
      return `${t('date')}: ${presetLabel}`
    }
  }

  if (start && end)
    return `${t('date')}: ${formatDateTimeShort(start)} - ${formatDateTimeShort(end)}`
  if (start) return `${t('date')}: >= ${formatDateTimeShort(start)}`
  if (end) return `${t('date')}: <= ${formatDateTimeShort(end)}`
  return t('date')
}
