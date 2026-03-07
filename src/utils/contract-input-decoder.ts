import { decodeContractEntryInputData } from '@qubic.ts/contracts/src/codec/entry-input.js'
import { coreContractsRegistry } from '@qubic.ts/contracts/src/generated/core-registry.js'
import type { ContractEntryKind } from '@qubic.ts/contracts/src/registry/types.js'
import { identityFromPublicKey } from '@qubic.ts/core'

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
      reason: 'missing-input-data' | 'invalid-input-data' | 'no-match' | 'decode-failed'
      message?: string
    }>

const registryEntries: readonly RegistryEntryRef[] = coreContractsRegistry.contracts.flatMap(
  (contract) =>
    contract.entries.map((entry) => ({
      contractName: contract.name,
      contractIndex: contract.contractIndex,
      entryName: entry.name,
      inputTypeName: entry.inputTypeName,
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

const MAX_INPUT_DATA_LENGTH = 64 * 1024
const HEX_32_BYTES = /^0x[0-9a-fA-F]{64}$/
const DECIMAL_STRING = /^\d+$/

const bytesFromBase64 = (value: string): Uint8Array => {
  const decoded = atob(value)
  const bytes = new Uint8Array(decoded.length)
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i)
  }
  return bytes
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

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

const ioTypeMapByContractName = new Map<string, ReadonlyMap<string, IoTypeLike>>()

const getIoTypeMapForContract = (contractName: string): ReadonlyMap<string, IoTypeLike> | null => {
  const contract = coreContractsRegistry.contracts.find((item) => item.name === contractName)
  if (!contract) return null

  const cached = ioTypeMapByContractName.get(contract.name)
  if (cached) return cached

  const ioTypeMap = new Map<string, IoTypeLike>()
  ;(contract.ioTypes ?? []).forEach((ioType) => {
    ioTypeMap.set(ioType.name, ioType)
  })
  ioTypeMapByContractName.set(contract.name, ioTypeMap)
  return ioTypeMap
}

const collectPathsByPredicate = (
  candidate: RegistryEntryRef,
  isMatch: (normalizedTypeExpression: string) => boolean
): ReadonlySet<string> => {
  const ioTypeMap = getIoTypeMapForContract(candidate.contractName)
  if (!ioTypeMap) return new Set<string>()

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

  visitByTypeName(candidate.inputTypeName, '')
  return matchingPaths
}

const collectIdentityPathsForInput = (candidate: RegistryEntryRef): ReadonlySet<string> =>
  collectPathsByPredicate(candidate, isIdentityTypeExpression)

const collectUint64PathsForInput = (candidate: RegistryEntryRef): ReadonlySet<string> =>
  collectPathsByPredicate(
    candidate,
    (normalizedTypeExpression) => normalizedTypeExpression === 'uint64'
  )

const isHumanReadableU64Path = (path: string): boolean => {
  const normalized = path.trim().toLowerCase()
  if (!normalized) return false
  const lastSegment = normalized.split('.').at(-1) ?? normalized
  return /name|symbol|ticker|label|code|unit/.test(lastSegment)
}

const collectHumanReadableUint64PathsForInput = (
  candidate: RegistryEntryRef
): ReadonlySet<string> => {
  const uint64Paths = collectUint64PathsForInput(candidate)
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
  path = '',
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

const decodeCandidate = (candidate: RegistryEntryRef, bytes: Uint8Array) =>
  decodeContractEntryInputData({
    registry: coreContractsRegistry,
    contractName: candidate.contractName,
    entryName: candidate.entryName,
    kind: candidate.kind,
    bytes
  })

const sortCandidatesForTxInput = (
  candidates: readonly RegistryEntryRef[],
  byteLength: number
): RegistryEntryRef[] =>
  [...candidates].sort((a, b) => {
    const aKindRank = a.kind === 'procedure' ? 0 : 1
    const bKindRank = b.kind === 'procedure' ? 0 : 1
    if (aKindRank !== bKindRank) return aKindRank - bKindRank

    const aSizeGap =
      a.inputSize === undefined ? Number.MAX_SAFE_INTEGER : Math.abs(a.inputSize - byteLength)
    const bSizeGap =
      b.inputSize === undefined ? Number.MAX_SAFE_INTEGER : Math.abs(b.inputSize - byteLength)
    if (aSizeGap !== bSizeGap) return aSizeGap - bSizeGap

    return a.entryName.localeCompare(b.entryName)
  })

export const decodeContractInputData = (params: {
  inputType: number
  inputData: string | Uint8Array | number[] | null | undefined
  destinationHint?: string | null
}): DecodedContractInput => {
  if (params.inputType <= 0) {
    return {
      status: 'unsupported',
      reason: 'no-match',
      message: 'Input type must be greater than zero for contract decoding.'
    }
  }

  const { bytes, invalid } = toBytes(params.inputData)
  if (invalid) {
    return { status: 'unsupported', reason: 'invalid-input-data' }
  }
  if (!bytes) {
    return { status: 'unsupported', reason: 'missing-input-data' }
  }

  const candidates = entriesByInputType.get(params.inputType) ?? []
  if (candidates.length === 0) {
    return { status: 'unsupported', reason: 'no-match' }
  }

  const destinationContractName = params.destinationHint
    ? registryContractNameByAddress.get(params.destinationHint.trim().toUpperCase())
    : undefined

  const preferredCandidates = destinationContractName
    ? candidates.filter((candidate) => candidate.contractName === destinationContractName)
    : []
  const fallbackCandidates = destinationContractName
    ? candidates.filter((candidate) => candidate.contractName !== destinationContractName)
    : candidates
  const orderedCandidates = [
    ...sortCandidatesForTxInput(preferredCandidates, bytes.length),
    ...sortCandidatesForTxInput(fallbackCandidates, bytes.length)
  ]

  let firstDecodeError: string | undefined
  let decodedResult: DecodedContractInput | null = null

  orderedCandidates.some((candidate) => {
    try {
      let decoded
      try {
        decoded = decodeCandidate(candidate, bytes)
      } catch (error) {
        if (candidate.inputSize === undefined || bytes.length >= candidate.inputSize) {
          throw error
        }

        const paddedBytes = new Uint8Array(candidate.inputSize)
        paddedBytes.set(bytes)
        decoded = decodeCandidate(candidate, paddedBytes)
      }

      decodedResult = {
        status: 'decoded',
        contractName: candidate.contractName,
        contractIndex: candidate.contractIndex,
        entryName: candidate.entryName,
        kind: candidate.kind,
        inputType: candidate.inputType,
        value: normalizeDecodedValue(
          decoded.value,
          '',
          collectIdentityPathsForInput(candidate),
          collectHumanReadableUint64PathsForInput(candidate)
        )
      }

      return true
    } catch (error) {
      if (!firstDecodeError) {
        firstDecodeError = getErrorMessage(error)
      }
      return false
    }
  })

  if (decodedResult) return decodedResult

  return {
    status: 'unsupported',
    reason: 'decode-failed',
    message: firstDecodeError
  }
}
