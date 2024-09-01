import type { TxEra } from '@app/types'
import { isTxEraType } from '@app/types/guards'
import { useSearchParams } from 'react-router-dom'

export default function useValidatedTxEra(defaultType: TxEra = 'latest'): TxEra {
  const [searchParams] = useSearchParams()
  const txTypeQueryParam = searchParams.get('type')

  return isTxEraType(txTypeQueryParam) ? (txTypeQueryParam as TxEra) : defaultType
}
