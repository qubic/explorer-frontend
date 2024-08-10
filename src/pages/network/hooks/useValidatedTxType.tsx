import type { TxType } from '@app/types'
import { isTxType } from '@app/types/guards'
import { useSearchParams } from 'react-router-dom'

export default function useValidatedTxType(defaultType: TxType = 'latest'): TxType {
  const [searchParams] = useSearchParams()
  const txTypeQueryParam = searchParams.get('type')

  return isTxType(txTypeQueryParam) ? (txTypeQueryParam as TxType) : defaultType
}
