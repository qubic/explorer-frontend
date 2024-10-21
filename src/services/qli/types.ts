export interface Tick {
  tick: number
  arbitrated: boolean
}

export interface TickOverview {
  currentEpoch: number
  currentTick: number
  marketCapitalization: number
  numberOfEmptyTicks: number
  numberOfEntities: number
  numberOfTicks: number
  price: number
  supply: number
  timestamp: string
  ticks: Tick[]
}

export interface HistoricalTx {
  id: string
  executed: boolean
  tick: number
  includedByTickLeader: boolean
  sourceId: string
  destId: string
  amount: number
  type: number
  digest: string
  moneyFlew: boolean
  data: string
}

export interface ReportedValue {
  publicKey: string
  incomingAmount: number
  outgoingAmount: number
  numberOfIncomingTransfers: number
  numberOfOutgoingTransfers: number
  latestIncomingTransferTick: number
  latestOutgoingTransferTick: number
}

export interface ReportedValues {
  [ip: string]: ReportedValue
}

export interface Address {
  id: string
  latestTransfers: HistoricalTx[]
  reportedValues: ReportedValues
}

export interface Asset {
  publicId: string
  contractIndex: number
  assetName: string
  issuerIdentity: string
  contractName: string
  ownedAmount: number
  possessedAmount: number
  tick: number
  reportingNodes: string[]
}
