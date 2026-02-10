import type { TFunction } from 'i18next'

import type { Option } from '@app/components/ui/Select'
import { TransactionOptionEnum } from '@app/types'

export const OVERVIEW_DATA_POLLING_INTERVAL_MS = 60_000

export const DEFAULT_PAGE_SIZE = 15

export const PAGE_SIZE_OPTIONS = [
  { i18nKey: 'showItemsPerPage', value: '15' },
  { i18nKey: 'showItemsPerPage', value: '30' },
  { i18nKey: 'showItemsPerPage', value: '50' },
  { i18nKey: 'showItemsPerPage', value: '100' }
]

export const VALID_PAGE_SIZES = [15, 30, 50, 100] as const

export const getPageSizeSelectOptions = (t: TFunction) =>
  PAGE_SIZE_OPTIONS.map((option) => ({
    label: t(option.i18nKey, { count: parseInt(option.value, 10) }),
    value: option.value
  }))

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
  getPageSizeSelectOptions
}
