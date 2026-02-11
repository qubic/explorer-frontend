import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { QX_ADDRESS } from '@app/utils/qubic-ts'

export type TransactionEvent = {
  epoch: number
  tickNumber: number
  timestamp: number // epoch_millis
  emittingContractIndex: number
  transactionHash: string
  logId: number
  logDigest: string
  type: number
  category: number
  source: string
  destination: string
  amount: number
  assetName?: string
  assetIssuer?: string
  numberOfShares?: number
  managingContractIndex?: number
  unitOfMeasurement?: string
  numberOfDecimalPlaces?: number
  deductedAmount?: number
  remainingAmount?: number
  contractIndex?: number
  contractIndexBurnedFor?: number
}

// Event type numeric codes
export const EVENT_TYPES = {
  QU_TRANSFER: 0,
  ASSET_ISSUANCE: 1,
  ASSET_OWNERSHIP_CHANGE: 2,
  ASSET_POSSESSION_CHANGE: 3,
  CONTRACT_ERROR: 4,
  CONTRACT_WARNING: 5,
  CONTRACT_INFO: 6,
  CONTRACT_DEBUG: 7,
  BURN: 8,
  DUST_BURN: 9
} as const

export const EVENT_TYPE_LABELS: Record<number, string> = {
  [EVENT_TYPES.QU_TRANSFER]: 'QU_TRANSFER',
  [EVENT_TYPES.ASSET_ISSUANCE]: 'ASSET_ISSUANCE',
  [EVENT_TYPES.ASSET_OWNERSHIP_CHANGE]: 'ASSET_OWNERSHIP_CHANGE',
  [EVENT_TYPES.ASSET_POSSESSION_CHANGE]: 'ASSET_POSSESSION_CHANGE',
  [EVENT_TYPES.CONTRACT_ERROR]: 'CONTRACT_ERROR',
  [EVENT_TYPES.CONTRACT_WARNING]: 'CONTRACT_WARNING',
  [EVENT_TYPES.CONTRACT_INFO]: 'CONTRACT_INFO',
  [EVENT_TYPES.CONTRACT_DEBUG]: 'CONTRACT_DEBUG',
  [EVENT_TYPES.BURN]: 'BURN',
  [EVENT_TYPES.DUST_BURN]: 'DUST_BURN'
}

export function getEventTypeLabel(type: number): string {
  return EVENT_TYPE_LABELS[type] ?? `UNKNOWN(${type})`
}

export function generateMockEvents(transactions: QueryServiceTransaction[]): TransactionEvent[] {
  let idCounter = 0

  return transactions.flatMap((tx) => {
    const amount = Number(tx.amount)
    const events: TransactionEvent[] = []
    const tickTimestamp = tx.timestamp ? new Date(tx.timestamp).getTime() : Date.now()

    // Generate a QU_TRANSFER event for every transaction
    idCounter += 1
    events.push({
      epoch: 0,
      tickNumber: tx.tickNumber,
      timestamp: tickTimestamp,
      emittingContractIndex: 0,
      transactionHash: tx.hash,
      logId: idCounter,
      logDigest: '',
      type: EVENT_TYPES.QU_TRANSFER,
      category: 0,
      source: tx.source,
      destination: tx.destination,
      amount
    })

    // QX asset transfer: additionally generate ownership/possession change events
    if (tx.destination === QX_ADDRESS && tx.inputType === 2) {
      idCounter += 1
      events.push({
        epoch: 0,
        tickNumber: tx.tickNumber,
        timestamp: tickTimestamp,
        emittingContractIndex: 1,
        transactionHash: tx.hash,
        logId: idCounter,
        logDigest: '',
        type: EVENT_TYPES.ASSET_OWNERSHIP_CHANGE,
        category: 0,
        source: tx.source,
        destination: tx.destination,
        amount,
        assetName: 'QX'
      })
      idCounter += 1
      events.push({
        epoch: 0,
        tickNumber: tx.tickNumber,
        timestamp: tickTimestamp,
        emittingContractIndex: 1,
        transactionHash: tx.hash,
        logId: idCounter,
        logDigest: '',
        type: EVENT_TYPES.ASSET_POSSESSION_CHANGE,
        category: 0,
        source: tx.source,
        destination: tx.destination,
        amount,
        assetName: 'QX'
      })
    }

    return events
  })
}
