import {
  bytesFromBase64,
  coreContractsRegistry,
  decodeContractEntryInputData,
  type ContractEntryKind
} from '@qubic-labs/contracts'
import { identityFromPublicKey, writeU64LE } from '@qubic-labs/core'
import type { SmartContract } from '@app/store/apis/qubic-static'

type RegistryEntryRef = Readonly<{
  contractName: string
  contractAddress: string
  contractIndex: number
  entryName: string
  kind: ContractEntryKind
  inputType: number
  inputSize?: number
}>

export type ContractAddressHint = Readonly<{
  address: string
  contractName: string
}>

export const buildContractAddressHints = (
  contracts: readonly SmartContract[] | undefined
): ContractAddressHint[] =>
  (contracts ?? []).map((contract) => ({
    address: contract.address,
    contractName: contract.name
  }))

export type DecodedContractInput =
  | Readonly<{
      status: 'decoded'
      contractName: string
      contractIndex: number
      entryName: string
      kind: ContractEntryKind
      inputType: number
      value: unknown
    }>
  | Readonly<{
      status: 'unsupported'
      reason:
        | 'missing-input-data'
        | 'invalid-input-data'
        | 'no-match'
        | 'ambiguous'
        | 'decode-failed'
      message?: string
    }>

const registryEntries: readonly RegistryEntryRef[] = coreContractsRegistry.contracts.flatMap(
  (contract) =>
    contract.entries.map((entry) => ({
      contractName: contract.name,
      contractAddress: contract.address,
      contractIndex: contract.contractIndex,
      entryName: entry.name,
      kind: entry.kind,
      inputType: entry.inputType,
      inputSize: 'inputSize' in entry ? entry.inputSize : undefined
    }))
)

const entriesByInputType = new Map<number, RegistryEntryRef[]>()
registryEntries.forEach((entry) => {
  const current = entriesByInputType.get(entry.inputType)
  if (current) {
    current.push(entry)
  } else {
    entriesByInputType.set(entry.inputType, [entry])
  }
})

const HEX_32_BYTES = /^0x[0-9a-fA-F]{64}$/
const DECIMAL_STRING = /^\d+$/
const IDENTITY_LIKE_KEY = /^(issuer|owner|source|destination|identity|publickey|address)(\d+)?$/i
const ASSET_NAME_KEY = /^assetname$/i

const hex32ToBytes = (hex: string): Uint8Array => {
  const raw = hex.slice(2)
  const bytes = new Uint8Array(32)
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(raw.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

const asIdentityString = (value: unknown): string | null => {
  if (value instanceof Uint8Array && value.length === 32) {
    return identityFromPublicKey(value)
  }
  if (typeof value === 'string' && HEX_32_BYTES.test(value)) {
    return identityFromPublicKey(hex32ToBytes(value))
  }
  return null
}

const decodeAssetNameFromU64 = (value: bigint): string => {
  const bytes = new Uint8Array(8)
  writeU64LE(value, bytes, 0)
  const zeroIndex = bytes.indexOf(0)
  const endIndex = zeroIndex === -1 ? bytes.length : zeroIndex
  const chars = Array.from(bytes.subarray(0, endIndex)).map((code) => String.fromCharCode(code))
  return chars.join('')
}

const toBigIntLike = (value: unknown): bigint | null => {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isFinite(value)) return BigInt(Math.trunc(value))
  if (typeof value === 'string' && DECIMAL_STRING.test(value)) return BigInt(value)
  return null
}

const normalizeDecodedValue = (value: unknown, keyHint?: string): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDecodedValue(item))
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(record).map(([key, nested]) => [key, normalizeDecodedValue(nested, key)])
    )
  }

  if (!keyHint) return value
  const key = keyHint.trim()

  if (IDENTITY_LIKE_KEY.test(key)) {
    const identity = asIdentityString(value)
    if (identity) return identity
  }

  if (ASSET_NAME_KEY.test(key)) {
    const numeric = toBigIntLike(value)
    if (numeric !== null) {
      try {
        return decodeAssetNameFromU64(numeric)
      } catch {
        return value
      }
    }
  }

  return value
}

const toBytes = (
  inputData: string | Uint8Array | number[] | null | undefined
): { bytes: Uint8Array | null; invalid: boolean } => {
  if (!inputData) return { bytes: null, invalid: false }
  if (inputData instanceof Uint8Array) return { bytes: inputData, invalid: false }
  if (Array.isArray(inputData)) return { bytes: Uint8Array.from(inputData), invalid: false }
  if (typeof inputData !== 'string') return { bytes: null, invalid: true }

  const normalized = inputData.trim()
  if (!normalized) return { bytes: null, invalid: false }

  try {
    return { bytes: bytesFromBase64(normalized), invalid: false }
  } catch {
    return { bytes: null, invalid: true }
  }
}

const resolveCandidates = (params: {
  inputType: number
  inputSize: number
  contractIndex?: number
  destinationHint?: string
  kindHint?: ContractEntryKind
  contractHints?: readonly ContractAddressHint[]
}): readonly RegistryEntryRef[] => {
  const byInputType = entriesByInputType.get(params.inputType) ?? []
  const byKind =
    params.kindHint === undefined
      ? byInputType
      : byInputType.filter((entry) => entry.kind === params.kindHint)
  const byContractIndex =
    params.contractIndex === undefined
      ? byKind
      : byKind.filter((entry) => entry.contractIndex === params.contractIndex)

  const destination = params.destinationHint?.trim()
  const destinationName =
    destination && params.contractHints
      ? params.contractHints.find((hint) => hint.address === destination)?.contractName
      : undefined
  const normalizedDestination = destinationName?.trim().toUpperCase()
  const byDestination =
    normalizedDestination === undefined
      ? byContractIndex
      : byContractIndex.filter(
          (entry) => entry.contractName.toUpperCase() === normalizedDestination
        )

  if (byDestination.length === 1) return byDestination
  if (byDestination.length > 1) {
    const byDestinationSize = byDestination.filter((entry) => entry.inputSize === params.inputSize)
    if (byDestinationSize.length > 0) return byDestinationSize
    return byDestination
  }

  if (byContractIndex.length <= 1) return byContractIndex

  const bySize = byContractIndex.filter((entry) => entry.inputSize === params.inputSize)
  if (bySize.length > 0) return bySize

  return byContractIndex
}

export const decodeContractInputData = (params: {
  inputType: number
  inputData: string | Uint8Array | number[] | null | undefined
  destinationHint?: string
  contractIndex?: number
  kindHint?: ContractEntryKind
  contractHints?: readonly ContractAddressHint[]
}): DecodedContractInput => {
  const { bytes, invalid } = toBytes(params.inputData)
  if (!bytes) {
    return { status: 'unsupported', reason: invalid ? 'invalid-input-data' : 'missing-input-data' }
  }

  const candidates = resolveCandidates({
    inputType: params.inputType,
    inputSize: bytes.length,
    destinationHint: params.destinationHint,
    contractIndex: params.contractIndex,
    kindHint: params.kindHint,
    contractHints: params.contractHints
  })

  if (candidates.length === 0) {
    return {
      status: 'unsupported',
      reason: 'no-match',
      message: `No contract entry found for inputType=${params.inputType}`
    }
  }

  if (candidates.length > 1) {
    return {
      status: 'unsupported',
      reason: 'ambiguous',
      message: `Multiple contract entries found for inputType=${params.inputType}`
    }
  }

  const [candidate] = candidates
  try {
    const decoded = decodeContractEntryInputData({
      registry: coreContractsRegistry,
      contractName: candidate.contractName,
      entryName: candidate.entryName,
      kind: candidate.kind,
      bytes
    })
    return {
      status: 'decoded',
      contractName: candidate.contractName,
      contractIndex: candidate.contractIndex,
      entryName: candidate.entryName,
      kind: candidate.kind,
      inputType: candidate.inputType,
      value: normalizeDecodedValue(decoded.value)
    }
  } catch (error) {
    return {
      status: 'unsupported',
      reason: 'decode-failed',
      message: error instanceof Error ? error.message : 'Unknown decode error'
    }
  }
}
