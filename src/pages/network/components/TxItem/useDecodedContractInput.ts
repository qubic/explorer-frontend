import { useMemo } from 'react'

import {
  decodeContractInputData,
  type DecodedContractInput
} from '@app/utils/contract-input-decoder'
import { isSmartContractTx } from '@app/utils/qubic-ts'

type UseDecodedContractInputParams = Readonly<{
  showExtendedDetails: boolean
  destination: string
  inputType: number
  inputData: string | Uint8Array | number[] | null | undefined
}>

type UseDecodedContractInputResult = Readonly<{
  isContractTransaction: boolean
  shouldDecodeInput: boolean
  decodedInput: DecodedContractInput | null
}>

export const useDecodedContractInput = (
  params: UseDecodedContractInputParams
): UseDecodedContractInputResult => {
  const isContractTransaction = useMemo(
    () => isSmartContractTx(params.destination, params.inputType),
    [params.destination, params.inputType]
  )

  const shouldDecodeInput = useMemo(
    () =>
      params.showExtendedDetails &&
      isContractTransaction &&
      !!params.inputData &&
      params.inputData.length > 0 &&
      params.inputType > 0,
    [params.showExtendedDetails, isContractTransaction, params.inputData, params.inputType]
  )

  const decodedInput = useMemo(() => {
    if (!shouldDecodeInput) return null
    return decodeContractInputData({
      inputType: params.inputType,
      inputData: params.inputData,
      destinationHint: params.destination
    })
  }, [shouldDecodeInput, params.inputData, params.inputType, params.destination])

  return {
    isContractTransaction,
    shouldDecodeInput,
    decodedInput
  }
}
