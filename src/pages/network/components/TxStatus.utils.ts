import { isSendManyTx, isSimpleTransfer } from '@app/utils'

export type TxStatusType = 'success' | 'failure' | 'executed'

/**
 * Determines the transaction status based on transaction type and execution result.
 * - Simple transfers: inputType=0 AND amount>0
 * - Send many transfers: destId=QUTIL_ADDRESS AND inputType=1
 * - These transfers show success/failure based on moneyFlew
 * - Everything else: always "executed"
 */
export function getTxStatus(
  inputType: number,
  amount: number,
  moneyFlew: boolean,
  destId: string
): TxStatusType {
  if (!isSimpleTransfer(inputType, amount) && !isSendManyTx(destId, inputType)) {
    return 'executed'
  }
  return moneyFlew ? 'success' : 'failure'
}
