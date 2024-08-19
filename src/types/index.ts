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
