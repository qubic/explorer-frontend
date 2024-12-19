import type { HistoricalTx } from '@app/store/apis/qli'
import { type TransactionWithStatus } from '@app/types'
import { getTxType } from '@app/utils'
import convertHistoricalTxToLatestTx from './convertHistoricalTxToLatestTx'

export default function convertHistoricalTxToTxWithStatus(
  historicalTx: HistoricalTx
): TransactionWithStatus {
  return {
    tx: convertHistoricalTxToLatestTx(historicalTx),
    status: {
      txId: historicalTx.id,
      moneyFlew: historicalTx.moneyFlew,
      txType: getTxType(historicalTx)
    }
  }
}
