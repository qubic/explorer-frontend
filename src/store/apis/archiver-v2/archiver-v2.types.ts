export interface PaginationV2 {
  totalRecords: number
  currentPage: number
  totalPages: number
  pageSize: number
  nextPage: number
  previousPage: number
}

export interface Transaction {
  transaction: {
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
  timestamp: string
  moneyFlew: boolean
}

export type GetTransactionResponse = Transaction

export interface GetIdentityTransfersArgs {
  addressId: string
  startTick: number
  endTick: number
  page: number
  pageSize: number
}

export interface GetIdentityTransfersResponse {
  pagination: PaginationV2
  transactions: {
    identity: string
    tickNumber: number
    transactions: Transaction[]
  }[]
}

export interface GetTickTransactionsArgs {
  tick: number
  transfers: boolean
  approved: boolean
}

export interface GetTickTransactionsResponse {
  transactions: Transaction[]
}

export interface GetEpochTicksArgs {
  epoch: number
  pageSize: number
  page: number
}

export interface GetEpochTicksResponse {
  pagination: PaginationV2
  ticks: { tickNumber: number; isEmpty: boolean }[]
}
