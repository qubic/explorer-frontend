import {
  coreVersionedContractsRegistry,
  decodeHistoricalTransactionInput,
  type ContractDefinition,
  type ContractEntry,
  type ContractEntryKind,
  type ContractVersionDefinition
} from '@qubic.ts/contracts'
import { identityFromPublicKey } from '@qubic.ts/core'

export type DecodedContractInput =
  | Readonly<{
      status: 'decoded'
      contractName: string
      contractIndex: number
      entryName: string
      kind: ContractEntryKind
      inputType: number
      value: unknown
      identityPaths: ReadonlySet<string>
      decodeMode: 'typed' | 'named' | 'raw'
    }>
  | Readonly<{
      status: 'unsupported'
      reason:
        | 'missing-input-data'
        | 'invalid-input-data'
        | 'missing-epoch'
        | 'no-match'
        | 'decode-failed'
      message?: string
    }>

const MAX_INPUT_DATA_LENGTH = 64 * 1024
const HEX_32_BYTES = /^0x[0-9a-fA-F]{64}$/
const DECIMAL_STRING = /^\d+$/
const ROOT_PATH = ''

type IoTypeLike = Readonly<{
  kind: string
  name: string
  target?: string
  fields?: readonly Readonly<{ name: string; type: string }>[]
}>

type ContractDecodeMetadata = Readonly<{
  contract: ContractDefinition
  entry: ContractEntry
  fingerprint: string
}>

const versionByContractAndFingerprint = new Map<string, ContractVersionDefinition>()

coreVersionedContractsRegistry.contracts.forEach((timeline) => {
  timeline.versions.forEach((version) => {
    versionByContractAndFingerprint.set(
      `${timeline.contractIndex}:${version.fingerprint}`,
      version
    )
  })
})

const bytesFromBase64 = (value: string): Uint8Array => {
  const decoded = atob(value)
  const bytes = new Uint8Array(decoded.length)
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i)
  }
  return bytes
}

const toBytes = (
  inputData: string | Uint8Array | number[] | null | undefined
): { bytes: Uint8Array | null; invalid: boolean } => {
  if (!inputData) return { bytes: null, invalid: false }

  if (inputData instanceof Uint8Array) {
    if (inputData.length > MAX_INPUT_DATA_LENGTH) return { bytes: null, invalid: true }
    return { bytes: inputData, invalid: false }
  }

  if (Array.isArray(inputData)) {
    if (inputData.length > MAX_INPUT_DATA_LENGTH) return { bytes: null, invalid: true }
    return { bytes: Uint8Array.from(inputData), invalid: false }
  }

  if (typeof inputData !== 'string') return { bytes: null, invalid: true }

  const normalized = inputData.trim()
  if (normalized.length === 0) return { bytes: null, invalid: false }

  try {
    const bytes = bytesFromBase64(normalized)
    if (bytes.length > MAX_INPUT_DATA_LENGTH) return { bytes: null, invalid: true }
    return { bytes, invalid: false }
  } catch {
    return { bytes: null, invalid: true }
  }
}

const normalizeTypeExpression = (typeExpression: string): string =>
  typeExpression.replace(/\s+/g, '')

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

const ioTypeMapByFingerprint = new Map<string, ReadonlyMap<string, IoTypeLike>>()

const getIoTypeMapForContract = (
  contract: ContractDefinition,
  fingerprint: string
): ReadonlyMap<string, IoTypeLike> => {
  const cached = ioTypeMapByFingerprint.get(fingerprint)
  if (cached) return cached

  const ioTypes = contract.ioTypes ?? []
  const ioTypeMap = new Map<string, IoTypeLike>()
  ioTypes.forEach((ioType) => {
    ioTypeMap.set(ioType.name, ioType)
  })
  ioTypeMapByFingerprint.set(fingerprint, ioTypeMap)
  return ioTypeMap
}

const collectPathsByPredicate = (
  contract: ContractDefinition,
  entry: ContractEntry,
  fingerprint: string,
  isMatch: (normalizedTypeExpression: string) => boolean
): ReadonlySet<string> => {
  const ioTypeMap = getIoTypeMapForContract(contract, fingerprint)

  const matchingPaths = new Set<string>()
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
    const normalized = normalizeTypeExpression(typeExpression)
    if (isMatch(normalized)) {
      matchingPaths.add(path)
      return
    }

    const arraySpec = parseArrayType(normalized)
    if (arraySpec) {
      visitByTypeExpression(arraySpec.elementType, path)
      return
    }

    const ioType = ioTypeMap.get(normalized)
    if (!ioType) return
    visitByTypeName(ioType.name, path)
  }

  visitByTypeName(entry.inputTypeName ?? `${entry.name}_input`, '')
  return matchingPaths
}

const collectIdentityPathsForInput = (
  contract: ContractDefinition,
  entry: ContractEntry,
  fingerprint: string
): ReadonlySet<string> => collectPathsByPredicate(contract, entry, fingerprint, isIdentityTypeExpression)

const collectUint64PathsForInput = (
  contract: ContractDefinition,
  entry: ContractEntry,
  fingerprint: string
): ReadonlySet<string> =>
  collectPathsByPredicate(contract, entry, fingerprint, (normalizedTypeExpression) => normalizedTypeExpression === 'uint64')

const isHumanReadableU64Path = (path: string): boolean => {
  const normalized = path.trim().toLowerCase()
  if (!normalized) return false
  const lastSegment = normalized.split('.').at(-1) ?? normalized
  return /name|symbol|ticker|label|code|unit/.test(lastSegment)
}

const collectHumanReadableUint64PathsForInput = (
  contract: ContractDefinition,
  entry: ContractEntry,
  fingerprint: string
): ReadonlySet<string> => {
  const uint64Paths = collectUint64PathsForInput(contract, entry, fingerprint)
  return new Set(Array.from(uint64Paths).filter((path) => isHumanReadableU64Path(path)))
}

const hex32ToBytes = (hex: string): Uint8Array => {
  const raw = hex.slice(2)
  const bytes = new Uint8Array(32)
  for (let i = 0; i < 32; i += 1) {
    bytes[i] = Number.parseInt(raw.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

const toBigIntLike = (value: unknown): bigint | null => {
  if (typeof value === 'bigint') return value >= 0n ? value : null
  if (typeof value === 'number' && Number.isFinite(value)) {
    const truncated = Math.trunc(value)
    return truncated >= 0 ? BigInt(truncated) : null
  }
  if (typeof value === 'string' && DECIMAL_STRING.test(value)) {
    const numeric = BigInt(value)
    return numeric >= 0n ? numeric : null
  }
  return null
}

const decodeU64AsciiIfLikely = (value: unknown): string | null => {
  const numeric = toBigIntLike(value)
  if (numeric === null) return null

  const bytes = new Uint8Array(8)
  new DataView(bytes.buffer).setBigUint64(0, numeric, true)

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

const normalizeDecodedValue = (
  value: unknown,
  path = ROOT_PATH,
  identityPaths?: ReadonlySet<string>,
  humanReadableUint64Paths?: ReadonlySet<string>
): unknown => {
  if (humanReadableUint64Paths?.has(path)) {
    const maybeText = decodeU64AsciiIfLikely(value)
    if (maybeText !== null) {
      return maybeText
    }
  }

  if (typeof value === 'bigint') return value.toString()

  if (typeof value === 'string' && identityPaths?.has(path) && HEX_32_BYTES.test(value)) {
    return identityFromPublicKey(hex32ToBytes(value))
  }

  if (value instanceof Uint8Array) {
    if (identityPaths?.has(path) && value.length === 32) {
      return identityFromPublicKey(value)
    }
    return `0x${Array.from(value)
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')}`
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeDecodedValue(item, path, identityPaths, humanReadableUint64Paths)
    )
  }

  if (value && typeof value === 'object') {
    const normalizedEntries = Object.entries(value as Record<string, unknown>).map(([key, val]) => {
      const nextPath = path ? `${path}.${key}` : key
      return [key, normalizeDecodedValue(val, nextPath, identityPaths, humanReadableUint64Paths)]
    })
    return Object.fromEntries(normalizedEntries)
  }

  return value
}

const getVersionLookupKey = (contractIndex: number, fingerprint: string): string =>
  `${contractIndex}:${fingerprint}`

const resolveContractDecodeMetadata = (
  contractIndex: number,
  fingerprint: string,
  entryKind: ContractEntryKind,
  entryInputType: number,
  entryName: string
): ContractDecodeMetadata | null => {
  const version = versionByContractAndFingerprint.get(getVersionLookupKey(contractIndex, fingerprint))
  if (!version) return null

  const entry = version.contract.entries.find(
    (candidate) =>
      candidate.kind === entryKind &&
      candidate.inputType === entryInputType &&
      candidate.name === entryName
  )
  if (!entry) return null

  return {
    contract: version.contract,
    entry,
    fingerprint: version.fingerprint
  }
}

const createUnsupportedResult = (
  reason: Extract<DecodedContractInput, { status: 'unsupported' }>['reason'],
  message?: string
): DecodedContractInput => ({
  status: 'unsupported',
  reason,
  ...(message ? { message } : {})
})

export const decodeContractInputData = (params: {
  inputType: number
  inputData: string | Uint8Array | number[] | null | undefined
  destinationHint?: string | null
  epoch?: number | null
}): DecodedContractInput => {
  if (params.inputType <= 0) {
    return createUnsupportedResult(
      'no-match',
      'Input type must be greater than zero for contract decoding.'
    )
  }

  const { bytes, invalid } = toBytes(params.inputData)
  if (invalid) {
    return createUnsupportedResult('invalid-input-data')
  }
  if (!bytes) {
    return createUnsupportedResult('missing-input-data')
  }
  if (!params.epoch || params.epoch <= 0) {
    return createUnsupportedResult('missing-epoch')
  }

  const decoded = decodeHistoricalTransactionInput({
    registry: coreVersionedContractsRegistry,
    destination: params.destinationHint ?? undefined,
    inputType: params.inputType,
    inputBytes: bytes,
    epoch: params.epoch
  })

  if (!decoded.resolvedVersion || !decoded.entry) {
    return createUnsupportedResult('no-match')
  }

  const metadata = resolveContractDecodeMetadata(
    decoded.resolvedVersion.contractIndex,
    decoded.resolvedVersion.fingerprint,
    decoded.entry.kind,
    decoded.entry.inputType,
    decoded.entry.name
  )
  if (!metadata) {
    return createUnsupportedResult(
      'decode-failed',
      'Resolved contract version metadata was not found in the bundled registry.'
    )
  }

  const identityPaths = collectIdentityPathsForInput(
    metadata.contract,
    metadata.entry,
    metadata.fingerprint
  )
  const humanReadableUint64Paths = collectHumanReadableUint64PathsForInput(
    metadata.contract,
    metadata.entry,
    metadata.fingerprint
  )

  const normalizedValue =
    decoded.decoded.mode === 'typed'
      ? normalizeDecodedValue(decoded.decoded.value, ROOT_PATH, identityPaths, humanReadableUint64Paths)
      : normalizeDecodedValue(
          { rawBytes: decoded.decoded.rawBytes },
          ROOT_PATH,
          identityPaths,
          humanReadableUint64Paths
        )

  return {
    status: 'decoded',
    contractName: decoded.resolvedVersion.contractName,
    contractIndex: decoded.resolvedVersion.contractIndex,
    entryName: decoded.entry.name,
    kind: decoded.entry.kind,
    inputType: decoded.entry.inputType,
    value: normalizedValue,
    identityPaths,
    decodeMode: decoded.decoded.mode
  }
}
