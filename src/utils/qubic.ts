import type { SmartContract, TransactionInputType } from '@app/store/apis/qubic-static'
import { isSmartContractTx } from '@app/utils/qubic-ts'

/**
 * Get the procedure name for a smart contract transaction
 * @param contractAddress - The smart contract address
 * @param inputType - The transaction input type (procedure ID)
 * @param smartContracts - The smart contracts data from the API
 * @returns The procedure name if found, undefined otherwise
 */
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
