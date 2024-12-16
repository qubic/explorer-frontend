export interface Tick {
  tick: number
  arbitrated: boolean
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
