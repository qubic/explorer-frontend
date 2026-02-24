// ============================================================================
// EVENT TYPES & CONSTANTS
// ============================================================================

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

// Event type numeric codes (from core/src/logging.h)
export const EVENT_TYPES = {
  QU_TRANSFER: 0,
  ASSET_ISSUANCE: 1,
  ASSET_OWNERSHIP_CHANGE: 2,
  ASSET_POSSESSION_CHANGE: 3,
  CONTRACT_ERROR_MESSAGE: 4,
  CONTRACT_WARNING_MESSAGE: 5,
  CONTRACT_INFORMATION_MESSAGE: 6,
  CONTRACT_DEBUG_MESSAGE: 7,
  BURNING: 8,
  DUST_BURNING: 9,
  SPECTRUM_STATS: 10,
  ASSET_OWNERSHIP_MANAGING_CONTRACT_CHANGE: 11,
  ASSET_POSSESSION_MANAGING_CONTRACT_CHANGE: 12,
  CONTRACT_RESERVE_DEDUCTION: 13,
  ORACLE_QUERY_STATUS_CHANGE: 14,
  CUSTOM_MESSAGE: 255
} as const

// Subset of event types supported by the events API for filtering
export const EVENT_TYPE_FILTER_OPTIONS = [
  EVENT_TYPES.QU_TRANSFER,
  EVENT_TYPES.ASSET_ISSUANCE,
  EVENT_TYPES.ASSET_OWNERSHIP_CHANGE,
  EVENT_TYPES.ASSET_POSSESSION_CHANGE,
  EVENT_TYPES.BURNING,
  EVENT_TYPES.CONTRACT_RESERVE_DEDUCTION
] as const

export const EVENT_TYPE_LABELS: Record<number, string> = {
  [EVENT_TYPES.QU_TRANSFER]: 'QU_TRANSFER',
  [EVENT_TYPES.ASSET_ISSUANCE]: 'ASSET_ISSUANCE',
  [EVENT_TYPES.ASSET_OWNERSHIP_CHANGE]: 'ASSET_OWNERSHIP_CHANGE',
  [EVENT_TYPES.ASSET_POSSESSION_CHANGE]: 'ASSET_POSSESSION_CHANGE',
  [EVENT_TYPES.CONTRACT_ERROR_MESSAGE]: 'CONTRACT_ERROR_MESSAGE',
  [EVENT_TYPES.CONTRACT_WARNING_MESSAGE]: 'CONTRACT_WARNING_MESSAGE',
  [EVENT_TYPES.CONTRACT_INFORMATION_MESSAGE]: 'CONTRACT_INFORMATION_MESSAGE',
  [EVENT_TYPES.CONTRACT_DEBUG_MESSAGE]: 'CONTRACT_DEBUG_MESSAGE',
  [EVENT_TYPES.BURNING]: 'BURNING',
  [EVENT_TYPES.DUST_BURNING]: 'DUST_BURNING',
  [EVENT_TYPES.SPECTRUM_STATS]: 'SPECTRUM_STATS',
  [EVENT_TYPES.ASSET_OWNERSHIP_MANAGING_CONTRACT_CHANGE]:
    'ASSET_OWNERSHIP_MANAGING_CONTRACT_CHANGE',
  [EVENT_TYPES.ASSET_POSSESSION_MANAGING_CONTRACT_CHANGE]:
    'ASSET_POSSESSION_MANAGING_CONTRACT_CHANGE',
  [EVENT_TYPES.CONTRACT_RESERVE_DEDUCTION]: 'CONTRACT_RESERVE_DEDUCTION',
  [EVENT_TYPES.ORACLE_QUERY_STATUS_CHANGE]: 'ORACLE_QUERY_STATUS_CHANGE',
  [EVENT_TYPES.CUSTOM_MESSAGE]: 'CUSTOM_MESSAGE'
}

export function getEventTypeLabel(type: number): string {
  return EVENT_TYPE_LABELS[type] ?? `UNKNOWN(${type})`
}

export function parseEventTypeParam(raw: string | null): number | undefined {
  if (raw === null || raw === '') return undefined
  const parsed = Number(raw)
  return (EVENT_TYPE_FILTER_OPTIONS as readonly number[]).includes(parsed) ? parsed : undefined
}

// ============================================================================
// RAW API RESPONSE TYPES
// ============================================================================

interface QuTransferData {
  source: string
  destination: string
  amount: string
}

interface AssetIssuanceData {
  assetIssuer: string
  numberOfShares: string
  managingContractIndex: string
  assetName: string
  numberOfDecimalPlaces: number
  unitOfMeasurement: string
}

interface AssetChangeData {
  source: string
  destination: string
  assetIssuer: string
  assetName: string
  numberOfShares: string
}

interface BurningData {
  source: string
  amount: string
  contractIndexBurnedFor: string
}

interface ContractReserveDeductionData {
  contractIndex: string
  deductedAmount: string
  remainingAmount: string
}

export interface RawApiEvent {
  epoch: number
  tickNumber: number
  timestamp: string
  emittingContractIndex: string
  transactionHash: string
  logId: string
  logDigest: string
  eventType: number
  category: number
  quTransfer?: QuTransferData
  assetIssuance?: AssetIssuanceData
  assetOwnershipChange?: AssetChangeData
  assetPossessionChange?: AssetChangeData
  burning?: BurningData
  dustBurning?: BurningData
  contractReserveDeduction?: ContractReserveDeductionData
}

export interface RawGetEventsResponse {
  hits: {
    total: number
    from: number
    size: number
  }
  events: RawApiEvent[]
}

// ============================================================================
// API RESPONSE ADAPTER
// ============================================================================

export function adaptApiEvent(raw: RawApiEvent): TransactionEvent {
  const base: TransactionEvent = {
    epoch: raw.epoch,
    tickNumber: raw.tickNumber,
    timestamp: Number(raw.timestamp),
    emittingContractIndex: Number(raw.emittingContractIndex),
    transactionHash: raw.transactionHash,
    logId: Number(raw.logId),
    logDigest: raw.logDigest,
    type: raw.eventType,
    category: raw.category,
    source: '',
    destination: '',
    amount: 0
  }

  if (raw.quTransfer) {
    base.source = raw.quTransfer.source
    base.destination = raw.quTransfer.destination
    base.amount = Number(raw.quTransfer.amount)
  } else if (raw.assetIssuance) {
    base.source = raw.assetIssuance.assetIssuer
    base.assetName = raw.assetIssuance.assetName
    base.assetIssuer = raw.assetIssuance.assetIssuer
    base.numberOfShares = Number(raw.assetIssuance.numberOfShares)
    base.managingContractIndex = Number(raw.assetIssuance.managingContractIndex)
    base.unitOfMeasurement = raw.assetIssuance.unitOfMeasurement
    base.numberOfDecimalPlaces = raw.assetIssuance.numberOfDecimalPlaces
    base.amount = Number(raw.assetIssuance.numberOfShares)
  } else if (raw.assetOwnershipChange) {
    base.source = raw.assetOwnershipChange.source
    base.destination = raw.assetOwnershipChange.destination
    base.assetName = raw.assetOwnershipChange.assetName
    base.assetIssuer = raw.assetOwnershipChange.assetIssuer
    base.numberOfShares = Number(raw.assetOwnershipChange.numberOfShares)
    base.amount = Number(raw.assetOwnershipChange.numberOfShares)
  } else if (raw.assetPossessionChange) {
    base.source = raw.assetPossessionChange.source
    base.destination = raw.assetPossessionChange.destination
    base.assetName = raw.assetPossessionChange.assetName
    base.assetIssuer = raw.assetPossessionChange.assetIssuer
    base.numberOfShares = Number(raw.assetPossessionChange.numberOfShares)
    base.amount = Number(raw.assetPossessionChange.numberOfShares)
  } else if (raw.burning) {
    base.source = raw.burning.source
    base.amount = Number(raw.burning.amount)
    base.contractIndexBurnedFor = Number(raw.burning.contractIndexBurnedFor)
  } else if (raw.dustBurning) {
    base.source = raw.dustBurning.source
    base.amount = Number(raw.dustBurning.amount)
    base.contractIndexBurnedFor = Number(raw.dustBurning.contractIndexBurnedFor)
  } else if (raw.contractReserveDeduction) {
    base.contractIndex = Number(raw.contractReserveDeduction.contractIndex)
    base.deductedAmount = Number(raw.contractReserveDeduction.deductedAmount)
    base.remainingAmount = Number(raw.contractReserveDeduction.remainingAmount)
    base.amount = Number(raw.contractReserveDeduction.deductedAmount)
  }

  return base
}
