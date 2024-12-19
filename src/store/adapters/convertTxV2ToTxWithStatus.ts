import type { TransactionV2 } from '@app/store/apis/archiver-v2.types'
import type { TransactionWithStatus } from '@app/types'
import { getTxType } from '@app/utils'

export default function convertTxV2ToTxWithStatus(tx: TransactionV2): TransactionWithStatus {
  return {
    tx: tx.transaction,
    status: {
      txId: tx.transaction.txId,
      moneyFlew: tx.moneyFlew,
      txType: getTxType(tx.transaction)
    },
    timestamp: tx.timestamp
  }
}
