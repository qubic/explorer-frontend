import type { TFunction } from 'i18next'

import type { Option } from '@app/components/ui/Select'
import { TransactionOptionEnum } from '@app/types'

export const OVERVIEW_DATA_POLLING_INTERVAL_MS = 60_000

// Cache time for transaction and event queries (in seconds)
export const QUERY_CACHE_TIME = 30

export const DEFAULT_PAGE_SIZE = 25

export const PAGE_SIZE_OPTIONS = [
  { i18nKey: 'showItemsPerPage', value: '10' },
  { i18nKey: 'showItemsPerPage', value: '25' },
  { i18nKey: 'showItemsPerPage', value: '50' },
  { i18nKey: 'showItemsPerPage', value: '100' }
]

export const VALID_PAGE_SIZES = PAGE_SIZE_OPTIONS.map((o) => Number(o.value))

export function validatePageSize(raw: string | null): number {
  const parsed = parseInt(raw ?? String(DEFAULT_PAGE_SIZE), 10)
  return VALID_PAGE_SIZES.includes(parsed) ? parsed : DEFAULT_PAGE_SIZE
}

export const MAX_PAGE = 10_000

export function validatePage(raw: string | null): number {
  const parsed = parseInt(raw || '1', 10) || 1
  return Math.max(1, Math.min(parsed, MAX_PAGE))
}

export const getPageSizeSelectOptions = (t: TFunction) =>
  PAGE_SIZE_OPTIONS.map((option) => ({
    label: t(option.i18nKey, { count: parseInt(option.value, 10) }),
    value: option.value
  }))

export const RICH_LIST_DEFAULT_PAGE_SIZE = 10

type KeyedOption = Omit<Option<TransactionOptionEnum>, 'label'> & { labelKey: string }

export const TRANSACTION_OPTIONS: readonly KeyedOption[] = [
  { labelKey: 'filterAllTransactions', value: TransactionOptionEnum.ALL },
  { labelKey: 'filterTransferTransactions', value: TransactionOptionEnum.TRANSFER },
  { labelKey: 'filterApprovedTransactions', value: TransactionOptionEnum.APPROVED }
] as const

export const TRANSACTION_OPTIONS_MOBILE: readonly KeyedOption[] = [
  { labelKey: 'filterAll', value: TransactionOptionEnum.ALL },
  { labelKey: 'filterTransfer', value: TransactionOptionEnum.TRANSFER },
  { labelKey: 'filterApproved', value: TransactionOptionEnum.APPROVED }
] as const

export default {
  TRANSACTION_OPTIONS,
  TRANSACTION_OPTIONS_MOBILE,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  VALID_PAGE_SIZES,
  getPageSizeSelectOptions,
  RICH_LIST_DEFAULT_PAGE_SIZE
}
