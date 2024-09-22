import type { TxType } from '@app/types'
import { TxTypeEnum } from '@app/types'
import { isTransferTx } from './qubic-ts'

// eslint-disable-next-line import/prefer-default-export -- Remove this comment when adding more functions
export const getTxType = (tx: {
  sourceId: string
  destId: string
  amount: string | number
}): TxType =>
  isTransferTx(tx.sourceId, tx.destId, tx.amount) ? TxTypeEnum.TRANSFER : TxTypeEnum.PROTOCOL
