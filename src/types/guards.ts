import type { TxType } from './index'

// TODO: Remove this disabled rule once we have more named exports
// eslint-disable-next-line import/prefer-default-export
export const isTxType = (value: string | null): value is TxType => {
  return value === 'latest' || value === 'historical'
}
