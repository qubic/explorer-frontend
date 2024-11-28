export interface Balance {
  id: string
  balance: string
  validForTick: number
  latestIncomingTransferTick: number
  latestOutgoingTransferTick: number
  incomingAmount: string
  outgoingAmount: string
  numberOfIncomingTransfers: number
  numberOfOutgoingTransfers: number
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

export interface LastProcessedTick {
  tickNumber: number
  epoch: number
}

export interface LastProcessedTicksPerEpoch {
  [key: string]: number
}

export interface SkipedTick {
  startTick: number
  endTick: number
}

export interface TickInterval {
  initialProcessedTick: number
  lastProcessedTick: number
}

export interface ProcessedTickIntervalPerEpoch {
  epoch: number
  intervals: TickInterval[]
}

export interface Entity {
  identity: string
  balance: string
}

export interface PaginationInfo {
  totalRecords: number
  currentPage: number
  totalPages: number
}

export interface GetStatusResponse {
  lastProcessedTick: LastProcessedTick
  lastProcessedTicksPerEpoch: LastProcessedTicksPerEpoch
  skippedTicks: SkipedTick[]
  processedTickIntervalsPerEpoch: ProcessedTickIntervalPerEpoch[]
}

export interface GetLatestStatsResponse {
  data: {
    timestamp: string
    circulatingSupply: string
    activeAddresses: number
    price: number
    marketCap: string
    epoch: number
    currentTick: number
    ticksInCurrentEpoch: number
    emptyTicksInCurrentEpoch: number
    epochTickQuality: number
    burnedQus: string
  }
}

export interface GetAddressTransferTransactionsResponse {
  transferTransactionsPerTick: {
    tickNumber: number
    identity: string
    transactions: Transaction[]
  }[]
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
