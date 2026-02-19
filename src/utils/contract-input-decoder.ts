import {
  bytesFromBase64,
  coreContractsRegistry,
  decodeContractEntryInputData,
  type ContractEntryKind
} from '@qubic-labs/contracts'
import { identityFromPublicKey, writeU64LE } from '@qubic-labs/core'

type RegistryEntryRef = Readonly<{
  contractName: string
  contractIndex: number
  entryName: string
  inputTypeName: string
  kind: ContractEntryKind
  inputType: number
  inputSize?: number
}>

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
      contractIndex: contract.contractIndex,
      entryName: entry.name,
      inputTypeName: `${entry.name}_input`,
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
const registryContractNameByAddress = new Map<string, string>()
coreContractsRegistry.contracts.forEach((contract) => {
  registryContractNameByAddress.set(contract.address.trim().toUpperCase(), contract.name.trim())
})

const HEX_32_BYTES = /^0x[0-9a-fA-F]{64}$/
const DECIMAL_STRING = /^\d+$/

const hex32ToBytes = (hex: string): Uint8Array => {
  const raw = hex.slice(2)
  const bytes = new Uint8Array(32)
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(raw.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

const asPublicKeyBytes = (value: unknown): Uint8Array | null => {
  if (value instanceof Uint8Array && value.length === 32) {
    return value
  }

  if (Array.isArray(value) && value.length === 32) {
    const allBytes = value.every(
      (item) => typeof item === 'number' && Number.isInteger(item) && item >= 0 && item <= 255
    )
    if (allBytes) {
      return Uint8Array.from(value)
    }
  }

  return null
}

const asIdentityString = (value: unknown): string | null => {
  const bytes = asPublicKeyBytes(value)
  if (bytes) {
    return identityFromPublicKey(bytes)
  }
  if (typeof value === 'string' && HEX_32_BYTES.test(value)) {
    return identityFromPublicKey(hex32ToBytes(value))
  }
  return null
}

const toBigIntLike = (value: unknown): bigint | null => {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isFinite(value)) return BigInt(Math.trunc(value))
  if (typeof value === 'string' && DECIMAL_STRING.test(value)) return BigInt(value)
  return null
}

const decodeU64AsciiIfLikely = (value: unknown): string | null => {
  const numeric = toBigIntLike(value)
  if (numeric === null) return null

  const bytes = new Uint8Array(8)
  writeU64LE(numeric, bytes, 0)

  const zeroIndex = bytes.indexOf(0)
  const endIndex = zeroIndex === -1 ? bytes.length : zeroIndex
  if (endIndex === 0) return null

  if (zeroIndex !== -1 && !bytes.subarray(zeroIndex).every((byte) => byte === 0)) {
    return null
  }

  const printable = bytes.subarray(0, endIndex)
  const allPrintable = printable.every((byte) => byte >= 32 && byte <= 126)
  if (!allPrintable) return null

  return String.fromCharCode(...printable)
}

type IoTypeLike = Readonly<{
  kind: string
  name: string
  target?: string
  fields?: readonly Readonly<{ name: string; type: string }>[]
}>

const normalizeTypeExpression = (typeExpression: string): string =>
  typeExpression.replace(/\s+/g, '').trim()

const parseArrayType = (
  typeExpression: string
): { readonly elementType: string; readonly length: number } | null => {
  const normalized = normalizeTypeExpression(typeExpression)
  const match = normalized.match(/^\[(\d+)](.+)$/)
  if (!match) return null
  return {
    length: Number(match[1]),
    elementType: match[2]
  }
}

const isIdentityTypeExpression = (typeExpression: string): boolean => {
  const normalized = normalizeTypeExpression(typeExpression)
  if (normalized === 'id') return true
  const arraySpec = parseArrayType(normalized)
  return arraySpec ? isIdentityTypeExpression(arraySpec.elementType) : false
}

const collectIdentityPathsForInput = (candidate: RegistryEntryRef): ReadonlySet<string> => {
  const contract = coreContractsRegistry.contracts.find(
    (item) => item.name === candidate.contractName
  )
  if (!contract) return new Set<string>()

  const ioTypeMap = new Map<string, IoTypeLike>()
  ;(contract.ioTypes ?? []).forEach((ioType) => {
    ioTypeMap.set(ioType.name, ioType)
  })

  const identityPaths = new Set<string>()
  const visitedTypeNames = new Set<string>()
  let visitByTypeExpression: (typeExpression: string, path: string) => void

  const visitByTypeName = (typeName: string, path: string): void => {
    const ioType = ioTypeMap.get(typeName)
    if (!ioType) return

    if (ioType.kind === 'alias') {
      if (!ioType.target) return
      if (visitedTypeNames.has(ioType.name)) return
      visitedTypeNames.add(ioType.name)
      visitByTypeExpression(ioType.target, path)
      visitedTypeNames.delete(ioType.name)
      return
    }

    if (ioType.kind !== 'struct' || !ioType.fields) return
    if (visitedTypeNames.has(ioType.name)) return
    visitedTypeNames.add(ioType.name)
    ioType.fields.forEach((field) => {
      const fieldPath = path ? `${path}.${field.name}` : field.name
      visitByTypeExpression(field.type, fieldPath)
    })
    visitedTypeNames.delete(ioType.name)
  }

  visitByTypeExpression = (typeExpression: string, path: string): void => {
    if (isIdentityTypeExpression(typeExpression)) {
      identityPaths.add(path)
      return
    }

    const normalized = normalizeTypeExpression(typeExpression)
    const arraySpec = parseArrayType(normalized)
    if (arraySpec) {
      visitByTypeExpression(arraySpec.elementType, path)
      return
    }

    const ioType = ioTypeMap.get(normalized)
    if (!ioType) return
    visitByTypeName(ioType.name, path)
  }

  visitByTypeName(candidate.inputTypeName, '')
  return identityPaths
}

const collectUint64PathsForInput = (candidate: RegistryEntryRef): ReadonlySet<string> => {
  const contract = coreContractsRegistry.contracts.find(
    (item) => item.name === candidate.contractName
  )
  if (!contract) return new Set<string>()

  const ioTypeMap = new Map<string, IoTypeLike>()
  ;(contract.ioTypes ?? []).forEach((ioType) => {
    ioTypeMap.set(ioType.name, ioType)
  })

  const uint64Paths = new Set<string>()
  const visitedTypeNames = new Set<string>()
  let visitByTypeExpression: (typeExpression: string, path: string) => void

  const visitByTypeName = (typeName: string, path: string): void => {
    const ioType = ioTypeMap.get(typeName)
    if (!ioType) return

    if (ioType.kind === 'alias') {
      if (!ioType.target) return
      if (visitedTypeNames.has(ioType.name)) return
      visitedTypeNames.add(ioType.name)
      visitByTypeExpression(ioType.target, path)
      visitedTypeNames.delete(ioType.name)
      return
    }

    if (ioType.kind !== 'struct' || !ioType.fields) return
    if (visitedTypeNames.has(ioType.name)) return
    visitedTypeNames.add(ioType.name)
    ioType.fields.forEach((field) => {
      const fieldPath = path ? `${path}.${field.name}` : field.name
      visitByTypeExpression(field.type, fieldPath)
    })
    visitedTypeNames.delete(ioType.name)
  }

  visitByTypeExpression = (typeExpression: string, path: string): void => {
    if (normalizeTypeExpression(typeExpression) === 'uint64') {
      uint64Paths.add(path)
    }

    const normalized = normalizeTypeExpression(typeExpression)
    const arraySpec = parseArrayType(normalized)
    if (arraySpec) {
      visitByTypeExpression(arraySpec.elementType, path)
      return
    }

    const ioType = ioTypeMap.get(normalized)
    if (!ioType) return
    visitByTypeName(ioType.name, path)
  }

  visitByTypeName(candidate.inputTypeName, '')
  return uint64Paths
}

const normalizeDecodedValue = (
  value: unknown,
  _keyHint?: string,
  path = '',
  identityPaths?: ReadonlySet<string>,
  uint64Paths?: ReadonlySet<string>
): unknown => {
  if (path && identityPaths?.has(path)) {
    const identity = asIdentityString(value)
    if (identity) return identity
  }

  if (path && uint64Paths?.has(path)) {
    const asAscii = decodeU64AsciiIfLikely(value)
    if (asAscii) return asAscii
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeDecodedValue(item, undefined, path, identityPaths, uint64Paths)
    )
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(record).map(([key, nested]) => {
        const nestedPath = path ? `${path}.${key}` : key
        return [key, normalizeDecodedValue(nested, key, nestedPath, identityPaths, uint64Paths)]
      })
    )
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
  destinationHint?: string
}): readonly RegistryEntryRef[] => {
  const byInputType = (entriesByInputType.get(params.inputType) ?? []).filter(
    (entry) => entry.kind === 'procedure'
  )

  const destination = params.destinationHint?.trim()
  const destinationName = destination
    ? registryContractNameByAddress.get(destination.toUpperCase())
    : undefined
  const normalizedDestination = destinationName?.trim().toUpperCase()
  const byDestination =
    normalizedDestination === undefined
      ? byInputType
      : byInputType.filter((entry) => entry.contractName.toUpperCase() === normalizedDestination)

  if (byDestination.length === 1) return byDestination
  if (byDestination.length > 1) {
    const byDestinationSize = byDestination.filter((entry) => entry.inputSize === params.inputSize)
    if (byDestinationSize.length > 0) return byDestinationSize
    return byDestination
  }

  if (byInputType.length <= 1) return byInputType

  const bySize = byInputType.filter((entry) => entry.inputSize === params.inputSize)
  if (bySize.length > 0) return bySize

  return byInputType
}

export const decodeContractInputData = (params: {
  inputType: number
  inputData: string | Uint8Array | number[] | null | undefined
  destinationHint?: string
}): DecodedContractInput => {
  const { bytes, invalid } = toBytes(params.inputData)
  if (!bytes) {
    return { status: 'unsupported', reason: invalid ? 'invalid-input-data' : 'missing-input-data' }
  }

  const candidates = resolveCandidates({
    inputType: params.inputType,
    inputSize: bytes.length,
    destinationHint: params.destinationHint
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
    const identityPaths = collectIdentityPathsForInput(candidate)
    const uint64Paths = collectUint64PathsForInput(candidate)
    return {
      status: 'decoded',
      contractName: candidate.contractName,
      contractIndex: candidate.contractIndex,
      entryName: candidate.entryName,
      kind: candidate.kind,
      inputType: candidate.inputType,
      value: normalizeDecodedValue(decoded.value, undefined, '', identityPaths, uint64Paths)
    }
  } catch (error) {
    return {
      status: 'unsupported',
      reason: 'decode-failed',
      message: error instanceof Error ? error.message : 'Unknown decode error'
    }
  }
}
