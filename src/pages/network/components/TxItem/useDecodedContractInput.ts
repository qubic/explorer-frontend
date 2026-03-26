import { useMemo } from 'react'

import { useGetTickDataQuery } from '@app/store/apis/query-service'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import {
  decodeContractInputData,
  type DecodedContractInput
} from '@app/utils/contract-input-decoder'
import {
  PLACE_BID_LABEL,
  decodeSharesAuctionBid,
  getSharesAuctionBidContract
} from '@app/utils/qubic'
import { isSmartContractTx } from '@app/utils/qubic-ts'

type UseDecodedContractInputParams = Readonly<{
  showExtendedDetails: boolean
  tickNumber: number
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
  const { data: smartContracts } = useGetSmartContractsQuery()

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

  const bidContract = useMemo(
    () =>
      getSharesAuctionBidContract(
        params.destination,
        params.inputType,
        tickData?.epoch,
        smartContracts
      ),
    [params.destination, params.inputType, tickData?.epoch, smartContracts]
  )

  const decodedInput = useMemo(() => {
    if (!shouldDecodeInput) return null
    if (!tickData?.epoch) return null

    if (bidContract && typeof params.inputData === 'string') {
      const bid = decodeSharesAuctionBid(params.inputData)
      if (bid) {
        return {
          status: 'decoded' as const,
          contractName: bidContract.label ?? bidContract.name,
          contractIndex: bidContract.contractIndex,
          entryName: PLACE_BID_LABEL,
          kind: 'procedure' as const,
          inputType: params.inputType,
          value: { price: bid.price.toString(), quantity: bid.quantity },
          identityPaths: new Set<string>(),
          decodeMode: 'typed' as const
        }
      }
    }

    return decodeContractInputData({
      epoch: tickData.epoch,
      inputType: params.inputType,
      inputData: params.inputData,
      destinationHint: params.destination
    })
  }, [
    shouldDecodeInput,
    tickData?.epoch,
    bidContract,
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
