import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { QX_ADDRESS } from '@app/utils/qubic-ts'

export type TransactionEvent = {
  id: number
  txId: string
  type: string
  source: string
  destination: string
  token: string
  amount: number
  tick?: number
  timestamp?: string
}

export function generateMockEvents(transactions: QueryServiceTransaction[]): TransactionEvent[] {
  let idCounter = 0

  return transactions.flatMap((tx) => {
    const amount = Number(tx.amount)
    const events: TransactionEvent[] = []

    // Generate a QU_TRANSFER event for every transaction
    idCounter += 1
    events.push({
      id: idCounter,
      txId: tx.hash,
      type: 'QU_TRANSFER',
      source: tx.source,
      destination: tx.destination,
      token: 'QUBIC',
      amount,
      tick: tx.tickNumber,
      timestamp: tx.timestamp
    })

    // QX asset transfer: additionally generate ownership/possession change events
    if (tx.destination === QX_ADDRESS && tx.inputType === 2) {
      idCounter += 1
      events.push({
        id: idCounter,
        txId: tx.hash,
        type: 'ASSET_OWNERSHIP_CHANGE',
        source: tx.source,
        destination: tx.destination,
        token: 'QX',
        amount,
        tick: tx.tickNumber,
        timestamp: tx.timestamp
      })
      idCounter += 1
      events.push({
        id: idCounter,
        txId: tx.hash,
        type: 'ASSET_POSSESSION_CHANGE',
        source: tx.source,
        destination: tx.destination,
        token: 'QX',
        amount,
        tick: tx.tickNumber,
        timestamp: tx.timestamp
      })
    }

    return events
  })
}
