export interface Balance {
  id: string
  balance: string
  validForTick: number
  latestIncomingTransferTick: number
  latestOutgoingTransferTick: number
}

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

export interface Transaction {
  txId: string
  sourceId: string
  destId: string
  amount: string
  tickNumber: number
  inputType: number
  inputSize: number
  inputHex: string
  signatureHex: string
}

export interface Computor {
  epoch: number
  itentities: string[]
  signatureHex: string
}

export interface GetBalancesResponse {
  balance: Balance
}

export interface GetTickDataResponse {
  tickData: TickData
}

export interface GetTickTransactionsResponse {
  transactions: Transaction[]
}

export interface GetTickTransferTransactionsResponse {
  transactions: Transaction[]
}

export interface GetTickApprovedTransactionsResponse {
  approvedTransactions: Transaction[]
}

export interface GetTransactionByIdResponse {
  transaction: Transaction
}

export interface GetEpochComputorsResponse {
  computors: Computor
}
