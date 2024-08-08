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

export interface TransactionStatus {
  txId: string
  moneyFlew: boolean
}

export interface Computor {
  epoch: number
  identities: string[]
  signatureHex: string
}

export interface GetBalanceResponse {
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

export interface GetTransactionResponse {
  transaction: Transaction
}

export interface GetTransactionStatusResponse {
  transactionStatus: TransactionStatus
}

export interface GetEpochComputorsResponse {
  computors: Computor
}
