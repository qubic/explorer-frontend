import type { Option } from '@app/components/ui/Select'
import { TransactionOptionEnum } from '@app/types'

export const OVERVIEW_DATA_POLLING_INTERVAL_MS = 60_000

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

export default { TRANSACTION_OPTIONS, TRANSACTION_OPTIONS_MOBILE }
