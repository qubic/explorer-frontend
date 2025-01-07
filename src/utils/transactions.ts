import type { TxType } from '@app/types'
import { TxTypeEnum } from '@app/types'
import { isTransferTx } from './qubic-ts'

export const getTxType = (tx: {
  sourceId: string
  destId: string
  amount: string | number
}): TxType =>
  isTransferTx(tx.sourceId, tx.destId, tx.amount) ? TxTypeEnum.TRANSFER : TxTypeEnum.PROTOCOL
