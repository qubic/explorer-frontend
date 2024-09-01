import { QubicDefinitions } from 'qubic-ts-library/dist/QubicDefinitions'
import { QubicTransferSendManyPayload } from 'qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload'

export const { QUTIL_ADDRESS, ARBITRATOR, EMPTY_ADDRESS } = QubicDefinitions

export type Transfer = {
  amount: string
  destId: string
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

export const isProtocolMessage = (address: string): boolean =>
  [ARBITRATOR, EMPTY_ADDRESS].includes(address)

export const isTransferTx = (
  sourceId: string,
  destId: string,
  amount: string | number
): boolean => {
  return !isProtocolMessage(sourceId) && !isProtocolMessage(destId) && Number(amount) > 0
}
