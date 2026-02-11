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
    source?: string // Comma-separated addresses (up to 5) to include
    'source-exclude'?: string // Comma-separated addresses (up to 5) to exclude
    destination?: string // Comma-separated addresses (up to 5) to include
    'destination-exclude'?: string // Comma-separated addresses (up to 5) to exclude
    amount?: string
    inputType?: string
    tickNumber?: string
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

// getTransactionsForTick request with filters
// Note: Unlike getTransactionsForIdentity, this endpoint only supports single address (no multi, no exclude)
export interface GetTransactionsForTickRequest {
  tickNumber: number
  filters?: {
    source?: string // Single address only
    destination?: string // Single address only
    amount?: string
    inputType?: string
  }
  ranges?: {
    amount?: Range
    inputType?: Range
  }
}
