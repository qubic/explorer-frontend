import type { Transaction } from '@app/services/archiver'

export interface TransactionV2 {
  transaction: Transaction
  timestamp: string
  moneyFlew: boolean
}

export type GetTransactionResponse = TransactionV2

export interface GetIdentityTransfersArgs {
  addressId: string
  startTick: number
  endTick: number
}

export interface GetIdentityTransfersResponse {
  transactions: {
    identity: string
    tickNumber: number
    transactions: TransactionV2[]
  }[]
}

export interface GetTickTransactionsArgs {
  tick: number
  transfers: boolean
  approved: boolean
}

export interface GetTickTransactionsResponse {
  transactions: TransactionV2[]
}

export interface GetEpochTicksArgs {
  epoch: number
  pageSize: number
  page: number
}

export interface GetEpochTicksResponse {
  pagination: {
    totalRecords: number
    currentPage: number
    totalPages: number
    pageSize: number
    nextPage: number
    previousPage: number
  }
  ticks: { tickNumber: number; isEmpty: boolean }[]
}
