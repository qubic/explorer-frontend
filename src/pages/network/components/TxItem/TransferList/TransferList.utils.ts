import type { TxItemVariant } from '../TxItem.types'

export const getTransferItemClassName = (
  index: number,
  totalEntries: number,
  variant: TxItemVariant
) => {
  if (variant === 'secondary') {
    return index !== totalEntries - 1 ? 'border-b-1 border-primary-60 py-12' : 'pt-12'
  }
  return 'py-8'
}

export default { getTransferItemClassName }
