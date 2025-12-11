import type { Transaction } from '../archiver-v2'
import type { HistoricalTx } from './qli.types'

export const convertQliTxToArchiverTx = (historicalTx: HistoricalTx): Transaction => ({
  transaction: {
    txId: historicalTx.id,
    sourceId: historicalTx.sourceId,
    destId: historicalTx.destId,
    amount: historicalTx.amount.toString(),
    tickNumber: historicalTx.tick,
    inputType: historicalTx.type,
    inputSize: 0, // Default to 0 since not present in historical
    inputHex: '', // Default to empty string since not present in historical
    signatureHex: historicalTx.data // Assuming 'data' field maps to 'signatureHex'}
  },
  timestamp: '', // Default to empty string since not present in historical
  moneyFlew: historicalTx.moneyFlew
})
