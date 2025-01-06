import type { Transaction } from '@app/store/apis/archiver-v2'

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

export type TransactionWithType = Transaction & { txType: TxType }

export enum TransactionOptionEnum {
  ALL = 'ALL',
  TRANSFER = 'TRANSFER',
  APPROVED = 'APPROVED'
}

export type ExchangeWallet = {
  name: string
  address: string
}
