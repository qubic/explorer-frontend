export interface QueryServiceTransaction {
  hash: string
  amount: string
  source: string
  destination: string
  tickNumber: number
  timestamp: string
  inputType: number
  inputSize: number
  inputData: string
  signature: string
  moneyFlew: boolean
}

export interface QueryServiceResponse {
  validForTick: number
  hits: {
    total: number
    from: number
    size: number
  }
  transactions: QueryServiceTransaction[]
}

export interface Range {
  gt?: string
  gte?: string
  lt?: string
  lte?: string
}

export interface GetTransactionsForIdentityRequest {
  identity: string
  filters?: {
    source?: string
    destination?: string
    amount?: string
    inputType?: string
  }
  ranges?: {
    amount?: Range
    tickNumber?: Range
    inputType?: Range
    timestamp?: Range
  }
  pagination?: {
    offset?: number
    size?: number
  }
}

// getTickData types
export interface TickData {
  tickNumber: number
  epoch: number
  computorIndex: number
  timestamp: string
  varStruct: string
  timeLock: string
  transactionHashes: string[]
  contractFees: number[]
  signature: string
}

export interface GetTickDataResponse {
  tickData: TickData
}

// getComputorListsForEpoch types
export interface ComputorList {
  epoch: number
  tickNumber: number
  identities: string[]
  signature: string
}

export interface GetComputorListsForEpochResponse {
  computorsLists: ComputorList[]
}
