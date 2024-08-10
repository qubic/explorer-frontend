import type { TxType } from './index'

export const isTxType = (value: string | null): value is TxType => {
  return value === 'latest' || value === 'historical'
}

export default { isTxType }
