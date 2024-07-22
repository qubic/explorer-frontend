export interface BalancesResponse {
  balance: {
    id: string
    balance: string
    validForTick: number
    latestIncomingTransferTick: number
    latestOutgoingTransferTick: number
  }
}

export interface GetTickDataResponse {
  tickData: {
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
}

export interface GetTransactionByIdResponse {
  transaction: {
    sourceId: string
    destId: string
    amount: string
    tickNumber: number
    inputType: number
    inputSize: number
    inputHex: string
    signatureHex: string
    txId: string
  }
}
