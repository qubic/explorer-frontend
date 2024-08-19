import type { HistoricalTx } from '@app/services/qli'
import { TxTypeEnum } from '@app/types'
import { isTransferTx } from '@app/utils/qubic-ts'
import type { TransactionWithStatus } from '../txSlice'
import convertHistoricalTxToLatestTx from './convertHistoricalTxToLatestTx'

export default function convertHistoricalTxToTxWithStatus(
  historicalTx: HistoricalTx
): TransactionWithStatus {
  return {
    tx: convertHistoricalTxToLatestTx(historicalTx),
    status: {
      txId: historicalTx.id,
      moneyFlew: historicalTx.moneyFlew,
      txType: isTransferTx(historicalTx.sourceId, historicalTx.destId, historicalTx.amount)
        ? TxTypeEnum.TRANSFER
        : TxTypeEnum.PROTOCOL
    }
  }
}
