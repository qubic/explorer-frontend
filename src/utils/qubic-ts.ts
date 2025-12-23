import { QubicDefinitions } from '@qubic-lib/qubic-ts-library/dist/QubicDefinitions'
import { PublicKey } from '@qubic-lib/qubic-ts-library/dist/qubic-types/PublicKey'
import { QubicTransferAssetPayload } from '@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferAssetPayload'
import { QubicTransferSendManyPayload } from '@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload'

export const { QUTIL_ADDRESS, ARBITRATOR, EMPTY_ADDRESS, QX_ADDRESS } = QubicDefinitions

export const ASSETS_ISSUER_ADDRESS = EMPTY_ADDRESS

// Asset category constant for Smart Contract Shares in asset filtering UI
export const ASSET_CATEGORY_SC_SHARES = 'sc-shares'

// QX asset name constant
export const QX_ASSET_NAME = 'QX'

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

/**
 * Validates if a Qubic address is valid by verifying its identity
 * First performs basic format checks (length and uppercase) before cryptographic validation
 * @param address - The address string to validate
 * @param skipCryptographicValidation - If true, only performs basic format validation (for internal links)
 * @returns Promise<boolean> - True if the address is valid, false otherwise
 */
export const isValidQubicAddress = async (
  address: string,
  skipCryptographicValidation = false
): Promise<boolean> => {
  if (!address || typeof address !== 'string') {
    return false
  }

  // Basic format validation first (no cryptographic operations needed)
  // Qubic addresses must be exactly 60 characters and all uppercase
  if (address.length !== 60 || !/^[A-Z]+$/.test(address)) {
    return false
  }

  // Skip expensive cryptographic validation if requested (e.g., for internal links)
  if (skipCryptographicValidation) {
    return true
  }

  // Only perform expensive cryptographic validation if basic format is valid
  try {
    const publicKey = new PublicKey(address)
    return await publicKey.verifyIdentity()
  } catch (error) {
    return false
  }
}
