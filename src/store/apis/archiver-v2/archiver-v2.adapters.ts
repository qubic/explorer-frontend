import type { TransactionWithType } from '@app/types'
import { getTxType } from '@app/utils'
import type { Transaction } from './archiver-v2.types'

// eslint-disable-next-line import/prefer-default-export
export const convertArchiverTxToTxWithType = (tx: Transaction): TransactionWithType => ({
  ...tx,
  txType: getTxType(tx.transaction)
})
