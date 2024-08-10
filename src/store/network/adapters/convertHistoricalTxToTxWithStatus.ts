import type { HistoricalTx } from '@app/services/qli'
import type { TransactionWithStatus } from '../txSlice'
import convertHistoricalTxToLatestTx from './convertHistoricalTxToLatestTx'

export default function convertHistoricalTxToTxWithStatus(
  historicalTx: HistoricalTx
): TransactionWithStatus {
  return {
    tx: convertHistoricalTxToLatestTx(historicalTx),
    status: { txId: historicalTx.id, moneyFlew: historicalTx.moneyFlew }
  }
}
