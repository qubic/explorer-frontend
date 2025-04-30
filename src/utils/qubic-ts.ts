import { QubicDefinitions } from '@qubic-lib/qubic-ts-library/dist/QubicDefinitions'
import { QubicTransferAssetPayload } from '@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferAssetPayload'
import { QubicTransferSendManyPayload } from '@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload'

export const { QUTIL_ADDRESS, ARBITRATOR, EMPTY_ADDRESS, QX_ADDRESS } = QubicDefinitions

export const ASSETS_ISSUER_ADDRESS = EMPTY_ADDRESS

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

export const getAssetsTransfers = async (data: string): Promise<AssetTransfer | null> => {
  const decoder = new TextDecoder()
  const binaryData = new Uint8Array(data.match(/.{1,2}/g)?.map((pair) => parseInt(pair, 16)) ?? [])

  const parsedPayload = await new QubicTransferAssetPayload().parse(binaryData)

  if (!parsedPayload) {
    return null
  }

  const assetName = decoder.decode(parsedPayload.getAssetName()).replace(/\0/g, '')
  const units = parsedPayload.getNumberOfUnits().getNumber().toString()
  const newOwnerAndPossessor = parsedPayload.getNewOwnerAndPossessor().getIdentityAsSring() ?? ''

  return {
    assetName,
    units,
    newOwnerAndPossessor
  }
}

export const isProtocolMessage = (address: string): boolean =>
  [ARBITRATOR, EMPTY_ADDRESS].includes(address)

export const isSmartContractTx = (destination: string, inputType: number): boolean =>
  !isProtocolMessage(destination) && inputType > 0

export const isTransferTx = (
  sourceId: string,
  destId: string,
  amount: string | number
): boolean => {
  return !isProtocolMessage(sourceId) && !isProtocolMessage(destId) && Number(amount) > 0
}

export const isAssetsIssuerAddress = (address: string): boolean => address === ASSETS_ISSUER_ADDRESS
