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
