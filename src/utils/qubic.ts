import type { SmartContract, TransactionInputType } from '@app/store/apis/qubic-static'
import { isSmartContractTx } from '@app/utils/qubic-ts'

export interface SharesAuctionBid {
  price: bigint
  quantity: number
}

export const decodeSharesAuctionBid = (inputData: string): SharesAuctionBid | undefined => {
  try {
    const binaryString = atob(inputData)
    const bytes = new Uint8Array(binaryString.length)
    bytes.forEach((_, i) => {
      bytes[i] = binaryString.charCodeAt(i)
    })
    const view = new DataView(bytes.buffer)
    return {
      price: view.getBigInt64(0, true),
      quantity: view.getInt16(8, true)
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

export const getTransactionTypeDisplay = (
  destination: string,
  inputType: number,
  smartContracts?: SmartContract[],
  protocolData?: TransactionInputType[]
): string => {
  if (isSmartContractTx(destination, inputType)) {
    return getProcedureName(destination, inputType, smartContracts) || 'SC'
  }
  return getInputTypeLabel(inputType, protocolData) || 'Standard'
}

export const getTransactionTypeDisplayLong = (
  destination: string,
  inputType: number,
  smartContracts?: SmartContract[],
  protocolData?: TransactionInputType[]
): string => {
  return `${getTransactionTypeDisplay(destination, inputType, smartContracts, protocolData)} (${inputType})`
}
