import type { SmartContract } from '@app/store/apis/qubic-static'
import { decode, identityFromPublicKey } from '@qubic-labs/kit'
import { kitContracts, type ContractSurface } from './qubic-kit-contracts'

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

type DecodeInputArgs = {
  inputHex?: string
  inputType: number
  destId: string
  smartContracts?: SmartContract[]
}

export type DecodedInputData = {
  rawHex: string
  decoded?: Record<string, unknown>
}

const normalizeHex = (inputHex: string): { prefixedHex: string; bytes: Uint8Array } => {
  const sanitized = inputHex.startsWith('0x') ? inputHex.slice(2) : inputHex
  const prefixedHex = inputHex.startsWith('0x') ? inputHex : `0x${sanitized}`
  const matches = sanitized.match(/.{1,2}/g) ?? []
  const payload = new Uint8Array(matches.map((byte) => parseInt(byte, 16)))
  return { prefixedHex, bytes: payload }
}

const ASCII_BIGINT_KEYS = new Set(['assetName'])

const decodeAsciiFromBigInt = (value: bigint): string | null => {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setBigUint64(0, value, true)

  const bytes = Array.from(new Uint8Array(buffer))

  const characterBytes = bytes.filter((byte) => byte >= 32 && byte <= 126)
  if (!characterBytes.length || characterBytes.length !== bytes.findIndex((byte) => byte === 0)) {
    return null
  }

  return characterBytes.map((byte) => String.fromCharCode(byte)).join('')
}

const bytesToHex = (value: Uint8Array): string =>
  Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const normalizeDecodedValue = async (value: unknown, key?: string): Promise<unknown> => {
  if (typeof value === 'bigint') {
    if (key && ASCII_BIGINT_KEYS.has(key)) {
      const ascii = decodeAsciiFromBigInt(value)
      if (ascii) {
        return ascii
      }
    }
    return value.toString()
  }

  if (value instanceof Uint8Array) {
    if (value.length === 32) {
      try {
        return await identityFromPublicKey(value)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to convert identity from bytes', error)
      }
    }
    return bytesToHex(value)
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => normalizeDecodedValue(item)))
  }

  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(async ([entryKey, entryValue]) => [
        entryKey,
        await normalizeDecodedValue(entryValue, entryKey)
      ])
    )
    return Object.fromEntries(entries)
  }

  return value
}

const findContractSurface = (
  destId: string,
  smartContracts?: SmartContract[]
): ContractSurface | undefined => {
  if (!smartContracts) return undefined

  const contract = smartContracts.find((sc) => sc.address === destId)
  if (!contract?.contractIndex) return undefined

  return kitContracts.find((surface) => surface.contractIndex === contract.contractIndex)
}

export const decodeTransactionInputData = async ({
  inputHex,
  inputType,
  destId,
  smartContracts
}: DecodeInputArgs): Promise<DecodedInputData | null> => {
  if (!inputHex) {
    return null
  }

  const { prefixedHex, bytes } = normalizeHex(inputHex)
  const surface = findContractSurface(destId, smartContracts)
  if (!surface) {
    return { rawHex: prefixedHex }
  }

  const procedure = surface.procedures.find((proc) => proc.selector === inputType)
  if (!procedure?.inputSchema) {
    return { rawHex: prefixedHex }
  }

  try {
    const decoded = decode<Record<string, unknown>>(procedure.inputSchema, bytes)

    return {
      rawHex: prefixedHex,
      decoded: (await normalizeDecodedValue(decoded)) as Record<string, unknown>
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to decode transaction input', error)
    return { rawHex: prefixedHex }
  }
}
