import type { Transaction } from '@app/services/archiver'
import type { HistoricalTx } from '@app/services/qli'

export default function convertHistoricalTxToLatestTx(historicalTx: HistoricalTx): Transaction {
  return {
    txId: historicalTx.id,
    sourceId: historicalTx.sourceId,
    destId: historicalTx.destId,
    amount: historicalTx.amount.toString(),
    tickNumber: historicalTx.tick,
    inputType: historicalTx.type,
    inputSize: 0, // Default to 0 since not present in historical
    inputHex: '', // Default to empty string since not present in historical
    signatureHex: historicalTx.data // Assuming 'data' field maps to 'signatureHex'
  }
}
