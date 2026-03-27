import type { SmartContract, TransactionInputType } from '@app/store/apis/qubic-static'
import { isSmartContractTx } from '@app/utils/qubic-ts'

export const PLACE_BID_LABEL = 'Place Bid'

export interface SharesAuctionBid {
  price: bigint
  quantity: number
}

export const decodeSharesAuctionBid = (inputData: string): SharesAuctionBid | undefined => {
  try {
    const binaryString = atob(inputData)
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0))
    if (bytes.length < 10) return undefined
    const view = new DataView(bytes.buffer)
    return {
      price: view.getBigUint64(0, true),
      quantity: view.getUint16(8, true)
    }
  } catch {
    return undefined
  }
}

export const getProcedureName = (
  contractAddress: string,
  inputType: number,
  smartContracts?: SmartContract[]
): string | undefined => {
  if (!smartContracts) return undefined

  const contract = smartContracts.find((sc) => sc.address === contractAddress)
  if (!contract) return undefined

  const procedure = contract.procedures.find((proc) => proc.id === inputType)
  return procedure?.name
}

export const getInputTypeLabel = (
  inputType: number,
  transactionInputTypes?: TransactionInputType[]
): string | undefined => {
  if (!transactionInputTypes) return undefined
  return transactionInputTypes.find((t) => t.id === inputType)?.label
}

export const getSharesAuctionBidContract = (
  destination: string,
  inputType: number,
  epoch?: number,
  smartContracts?: SmartContract[]
): SmartContract | undefined => {
  if (inputType !== 1 || epoch == null || !smartContracts) return undefined
  const contract = smartContracts.find((sc) => sc.address === destination)
  return contract && epoch === contract.sharesAuctionEpoch ? contract : undefined
}

export const getTransactionTypeDisplay = (
  destination: string,
  inputType: number,
  smartContracts?: SmartContract[],
  protocolData?: TransactionInputType[],
  epoch?: number
): string => {
  if (getSharesAuctionBidContract(destination, inputType, epoch, smartContracts)) {
    return PLACE_BID_LABEL
  }
  if (isSmartContractTx(destination, inputType)) {
    return getProcedureName(destination, inputType, smartContracts) || 'SC'
  }
  return getInputTypeLabel(inputType, protocolData) || 'Standard'
}

export const getTransactionTypeDisplayLong = (
  destination: string,
  inputType: number,
  smartContracts?: SmartContract[],
  protocolData?: TransactionInputType[],
  epoch?: number
): string => {
  return `${getTransactionTypeDisplay(destination, inputType, smartContracts, protocolData, epoch)} (${inputType})`
}
