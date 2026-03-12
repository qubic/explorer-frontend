// ============================================================================
// EVENT TYPES & CONSTANTS
// ============================================================================

export type TransactionEvent = {
  epoch: number
  tickNumber: number
  timestamp: number // epoch milliseconds (converted from API's epoch seconds)
  contractIndex: number
  transactionHash: string
  logId: number
  logDigest: string
  type: number
  categories: number[]
  isVirtualTx: boolean
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
}

// Log type numeric codes (from core/src/logging.h)
export const EVENT_TYPES = {
  QU_TRANSFER: 0,
  ASSET_ISSUANCE: 1,
  ASSET_OWNERSHIP_CHANGE: 2,
  ASSET_POSSESSION_CHANGE: 3,
  CONTRACT_ERROR: 4,
  CONTRACT_WARNING: 5,
  CONTRACT_INFO: 6,
  CONTRACT_DEBUG: 7,
  BURNING: 8,
  DUST_BURNING: 9,
  SPECTRUM_STATS: 10,
  ASSET_OWNERSHIP_MANAGING_CONTRACT_CHANGE: 11,
  ASSET_POSSESSION_MANAGING_CONTRACT_CHANGE: 12,
  CONTRACT_RESERVE_DEDUCTION: 13,
  ORACLE_QUERY_STATUS_CHANGE: 14,
  CUSTOM_MESSAGE: 255
} as const

// Event types supported by the events API for filtering.
// ORACLE_QUERY_STATUS_CHANGE (14) is excluded — not yet supported by the events API.
export const EVENT_TYPE_FILTER_OPTIONS = [
  EVENT_TYPES.QU_TRANSFER,
  EVENT_TYPES.ASSET_ISSUANCE,
  EVENT_TYPES.ASSET_OWNERSHIP_CHANGE,
  EVENT_TYPES.ASSET_POSSESSION_CHANGE,
  EVENT_TYPES.CONTRACT_ERROR,
  EVENT_TYPES.CONTRACT_WARNING,
  EVENT_TYPES.CONTRACT_INFO,
  EVENT_TYPES.CONTRACT_DEBUG,
  EVENT_TYPES.BURNING,
  EVENT_TYPES.DUST_BURNING,
  EVENT_TYPES.SPECTRUM_STATS,
  EVENT_TYPES.ASSET_OWNERSHIP_MANAGING_CONTRACT_CHANGE,
  EVENT_TYPES.ASSET_POSSESSION_MANAGING_CONTRACT_CHANGE,
  EVENT_TYPES.CONTRACT_RESERVE_DEDUCTION,
  EVENT_TYPES.CUSTOM_MESSAGE
] as const

export const EVENT_TYPE_LABELS: Record<number, string> = {
  [EVENT_TYPES.QU_TRANSFER]: 'QU_TRANSFER',
  [EVENT_TYPES.ASSET_ISSUANCE]: 'ASSET_ISSUANCE',
  [EVENT_TYPES.ASSET_OWNERSHIP_CHANGE]: 'ASSET_OWNERSHIP_CHANGE',
  [EVENT_TYPES.ASSET_POSSESSION_CHANGE]: 'ASSET_POSSESSION_CHANGE',
  [EVENT_TYPES.CONTRACT_ERROR]: 'CONTRACT_ERROR',
  [EVENT_TYPES.CONTRACT_WARNING]: 'CONTRACT_WARNING',
  [EVENT_TYPES.CONTRACT_INFO]: 'CONTRACT_INFO',
  [EVENT_TYPES.CONTRACT_DEBUG]: 'CONTRACT_DEBUG',
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

export const MAX_EVENT_TYPE_SELECTIONS = 5

export function parseEventTypesParam(raw: string | null): number[] {
  if (raw === null || raw === '') return []
  return [
    ...new Set(
      raw
        .split(',')
        .filter((s) => s !== '')
        .map(Number)
        .filter(
          (n) => !Number.isNaN(n) && (EVENT_TYPE_FILTER_OPTIONS as readonly number[]).includes(n)
        )
    )
  ].slice(0, MAX_EVENT_TYPE_SELECTIONS)
}

// Event category codes (from sysTransactionMap)
const SYSTEM_TX_CATEGORIES: Record<number, string> = {
  1: 'SC_INITIALIZE_TX',
  2: 'SC_BEGIN_EPOCH_TX',
  3: 'SC_BEGIN_TICK_TX',
  4: 'SC_END_TICK_TX',
  5: 'SC_END_EPOCH_TX',
  6: 'SC_NOTIFICATION_TX'
}

const VIRTUAL_TX_CATEGORIES = new Set([2, 3, 4, 5])

export function isVirtualTxCategory(categories: number[]): boolean {
  return categories.some((c) => VIRTUAL_TX_CATEGORIES.has(c))
}

export function getVirtualTxId(categories: number[], tickNumber: number): string {
  const virtualCategory = categories.find((c) => VIRTUAL_TX_CATEGORIES.has(c))
  const prefix =
    virtualCategory != null
      ? SYSTEM_TX_CATEGORIES[virtualCategory] ?? `CATEGORY_${virtualCategory}`
      : 'UNKNOWN'
  return `${prefix}_${tickNumber}`
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
  contractIndex: string
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
  contractIndex: string
  transactionHash: string
  logId: string
  logDigest: string
  logType: number
  categories: number[]
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
  const virtualTx = isVirtualTxCategory(raw.categories)
  const base: TransactionEvent = {
    epoch: raw.epoch,
    tickNumber: raw.tickNumber,
    timestamp: Number(raw.timestamp),
    contractIndex: Number(raw.contractIndex),
    transactionHash: virtualTx
      ? getVirtualTxId(raw.categories, raw.tickNumber)
      : raw.transactionHash,
    logId: Number(raw.logId),
    logDigest: raw.logDigest,
    type: raw.logType,
    categories: raw.categories,
    isVirtualTx: virtualTx,
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
    base.contractIndex = Number(raw.burning.contractIndex)
  } else if (raw.dustBurning) {
    base.source = raw.dustBurning.source
    base.amount = Number(raw.dustBurning.amount)
    base.contractIndex = Number(raw.dustBurning.contractIndex)
  } else if (raw.contractReserveDeduction) {
    base.contractIndex = Number(raw.contractReserveDeduction.contractIndex)
    base.deductedAmount = Number(raw.contractReserveDeduction.deductedAmount)
    base.remainingAmount = Number(raw.contractReserveDeduction.remainingAmount)
    base.amount = Number(raw.contractReserveDeduction.deductedAmount)
  }

  return base
}
