import type { Option } from '@app/components/ui/Select'
import { TransactionOptionEnum } from '@app/types'

export const OVERVIEW_DATA_POLLING_INTERVAL_MS = 60_000

export const TRANSACTION_OPTIONS: Option<TransactionOptionEnum>[] = [
  { label: 'All transactions', value: TransactionOptionEnum.ALL },
  { label: 'Transfer transactions', value: TransactionOptionEnum.TRANSFER },
  { label: 'Approved transactions', value: TransactionOptionEnum.APPROVED }
] as const

export const TRANSACTION_OPTIONS_MOBILE: Option<TransactionOptionEnum>[] = [
  { label: 'All', value: TransactionOptionEnum.ALL },
  { label: 'Transfer', value: TransactionOptionEnum.TRANSFER },
  { label: 'Approved', value: TransactionOptionEnum.APPROVED }
] as const

export default { TRANSACTION_OPTIONS, TRANSACTION_OPTIONS_MOBILE }
