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
