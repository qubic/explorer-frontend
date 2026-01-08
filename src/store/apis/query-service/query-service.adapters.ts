import type { Transaction } from '@app/store/apis/archiver-v2'
import { formatBase64 } from '@app/utils'
import type { QueryServiceTransaction } from './query-service.types'

/**
 * Converts archiver/qli transaction format to query-service format.
 * Works with both archiver-v2 Transaction and TransactionWithType.
 * Note: inputHex and signatureHex are converted from hex to base64 to match query-service format.
 */
export const convertToQueryServiceTx = (tx: Transaction): QueryServiceTransaction => ({
  hash: tx.transaction.txId,
  source: tx.transaction.sourceId,
  destination: tx.transaction.destId,
  amount: tx.transaction.amount,
  tickNumber: tx.transaction.tickNumber,
  inputType: tx.transaction.inputType,
  inputSize: tx.transaction.inputSize,
  inputData: formatBase64(tx.transaction.inputHex),
  signature: formatBase64(tx.transaction.signatureHex),
  timestamp: tx.timestamp ?? '',
  moneyFlew: tx.moneyFlew ?? false
})
