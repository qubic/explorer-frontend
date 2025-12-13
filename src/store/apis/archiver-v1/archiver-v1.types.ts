export interface TickData {
  computorIndex: number
  epoch: number
  tickNumber: number
  timestamp: string
  varStruct: string
  timeLock: string
  transactionIds: string[]
  contractFees: []
  signatureHex: string
}

// Response types
export interface GetTickDataResponse {
  tickData: TickData
}

export interface GetEpochComputorsResponse {
  computors: {
    epoch: number
    identities: string[]
    signatureHex: string
  }
}
