export type Language = {
  id: string
  label: string
}

export type TxEra = 'latest' | 'historical'

export enum TransactionOptionEnum {
  ALL = 'ALL',
  TRANSFER = 'TRANSFER',
  APPROVED = 'APPROVED'
}

export type ExchangeWallet = {
  name: string
  address: string
}
