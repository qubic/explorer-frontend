import type { Transaction, TransactionStatus } from '@app/services/archiver'

export type Language = {
  id: string
  label: string
}

export type TxEra = 'latest' | 'historical'

export enum TxTypeEnum {
  TRANSFER = 'TRANSFER',
  PROTOCOL = 'PROTOCOL'
}

export type TxType = keyof typeof TxTypeEnum

export type TransactionWithStatus = {
  tx: Transaction
  status: TransactionStatus & { txType: TxType }
  timestamp?: string
}

export enum TransactionOptionEnum {
  ALL = 'ALL',
  TRANSFER = 'TRANSFER',
  APPROVED = 'APPROVED'
}
