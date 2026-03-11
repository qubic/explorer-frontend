export type Language = {
  id: string
  label: string
}

export enum TransactionOptionEnum {
  ALL = 'ALL',
  TRANSFER = 'TRANSFER',
  APPROVED = 'APPROVED'
}

export type ExchangeWallet = {
  name: string
  address: string
}
