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
