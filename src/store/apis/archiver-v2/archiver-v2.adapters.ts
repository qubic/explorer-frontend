import type { TransactionWithType } from '@app/types'
import { getTxType } from '@app/utils'
import type { Transaction } from './archiver-v2.types'

export const convertArchiverTxToTxWithType = (tx: Transaction): TransactionWithType => ({
  ...tx,
  txType: getTxType(tx.transaction)
})
