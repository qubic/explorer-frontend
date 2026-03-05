import type { SmartContract } from '@app/store/apis/qubic-static'

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
