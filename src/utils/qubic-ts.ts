import { QubicDefinitions } from '@qubic-lib/qubic-ts-library/dist/QubicDefinitions'
import { QubicTransferAssetPayload } from '@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferAssetPayload'
import { QubicTransferSendManyPayload } from '@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload'

export const { QUTIL_ADDRESS, ARBITRATOR, EMPTY_ADDRESS } = QubicDefinitions

export const MAIN_ASSETS_ISSUER = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB'

export type Transfer = {
  amount: string
  destId: string
}

export type AssetTransfer = {
  assetName: string
  units: string
  newOwnerAndPossessor: string
}

export const getTransfers = async (data: string): Promise<Transfer[]> => {
  const binaryData = new Uint8Array(data.match(/.{1,2}/g)?.map((pair) => parseInt(pair, 16)) ?? [])

  const parsedSendManyPayload = await new QubicTransferSendManyPayload().parse(binaryData)

  const transfers = parsedSendManyPayload.getTransfers()

  const standardizedData = transfers.map((item) => ({
    amount: item.amount.getNumber().toString(),
    destId: item.destId.getIdentityAsSring() ?? ''
  }))

  return standardizedData
}

export const getAssetsTransfers = async (data: string): Promise<AssetTransfer> => {
  const decoder = new TextDecoder()
  const binaryData = new Uint8Array(data.match(/.{1,2}/g)?.map((pair) => parseInt(pair, 16)) ?? [])

  const parsedPayload = await new QubicTransferAssetPayload().parse(binaryData)

  const assetName = await decoder.decode(parsedPayload.getAssetName()).replace(/\0/g, '')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Doing this hacky way because the library has this properties as private
  const units = (parsedPayload as any).numberOfUnits.getNumber().toString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Doing this hacky way because the library has this properties as private
  const newOwnerAndPossessor = (parsedPayload as any).newOwnerAndPossessor.getIdentityAsSring()

  return {
    assetName,
    units,
    newOwnerAndPossessor
  }
}

export const isProtocolMessage = (address: string): boolean =>
  [ARBITRATOR, EMPTY_ADDRESS].includes(address)

export const isTransferTx = (
  sourceId: string,
  destId: string,
  amount: string | number
): boolean => {
  return !isProtocolMessage(sourceId) && !isProtocolMessage(destId) && Number(amount) > 0
}
