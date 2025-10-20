import type { SmartContract } from '@app/store/apis/qubic-static'

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
