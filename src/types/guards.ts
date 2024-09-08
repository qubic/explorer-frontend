import type { TxEra } from './index'

export const isTxEraType = (value: string | null): value is TxEra => {
  return value === 'latest' || value === 'historical'
}

export default { isTxEraType }
