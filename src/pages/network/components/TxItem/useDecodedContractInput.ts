import { useMemo } from 'react'

import { useGetTickDataQuery } from '@app/store/apis/query-service'
import {
  decodeContractInputData,
  type DecodedContractInput
} from '@app/utils/contract-input-decoder'
import { isSmartContractTx } from '@app/utils/qubic-ts'

type UseDecodedContractInputParams = Readonly<{
  showExtendedDetails: boolean
  destination: string
  tickNumber: number
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

  const { data: tickData } = useGetTickDataQuery(params.tickNumber, {
    skip: !shouldDecodeInput
  })

  const decodedInput = useMemo(() => {
    if (!shouldDecodeInput) return null
    if (!tickData?.epoch) return null

    return decodeContractInputData({
      epoch: tickData.epoch,
      inputType: params.inputType,
      inputData: params.inputData,
      destinationHint: params.destination
    })
  }, [
    shouldDecodeInput,
    tickData?.epoch,
    params.inputData,
    params.inputType,
    params.destination
  ])

  return {
    isContractTransaction,
    shouldDecodeInput,
    decodedInput
  }
}
