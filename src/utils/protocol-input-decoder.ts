import type { TransactionInputType } from '@app/store/apis/qubic-static'

import type { DecodedContractInput } from './contract-input-decoder'

const MIN_SIZES: Record<number, number> = {
  1: 880,
  2: 64,
  3: 24,
  4: 40,
  5: 56,
  6: 72,
  7: 8,
  8: 880,
  9: 8,
  10: 8
}

const formatByteSize = (bytes: number | bigint): string => {
  const n = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (n < 1024) return `${n.toLocaleString('en-US')} bytes`
  const mb = n / (1024 * 1024)
  if (mb >= 1)
    return `${mb.toLocaleString('en-US', { maximumFractionDigits: 2 })} MB (${n.toLocaleString('en-US')} bytes)`
  const kb = n / 1024
  return `${kb.toLocaleString('en-US', { maximumFractionDigits: 2 })} KB (${n.toLocaleString('en-US')} bytes)`
}

const NUM_COMPUTORS = 676
const PACKED_DATA_SIZE = 848
const DATA_LOCK_SIZE = 32

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const readAscii = (bytes: Uint8Array, offset: number, length: number): string => {
  const slice = bytes.subarray(offset, offset + length)
  const zeroIdx = slice.indexOf(0)
  const end = zeroIdx === -1 ? slice.length : zeroIdx
  return String.fromCharCode(...slice.subarray(0, end)).replace(/[^\x20-\x7E]/g, '')
}

/* eslint-disable no-bitwise */
const extract10BitValues = (data: Uint8Array, count: number): number[] => {
  const values: number[] = []
  for (let i = 0; i < count; i += 1) {
    const byteIndex = i + Math.floor(i / 4)
    const byte0 = data[byteIndex]
    const byte1 = data[byteIndex + 1]
    const lastBit0 = 8 - (i % 4) * 2
    const firstBit1 = 10 - lastBit0
    values.push(((byte0 & ((1 << lastBit0) - 1)) << firstBit1) | (byte1 >> (8 - firstBit1)))
  }
  return values
}

const decodeDateAndTime = (packed: bigint): string => {
  const year = Number((packed >> 46n) & 0x3ffffn)
  const month = Number((packed >> 42n) & 0xfn)
  const day = Number((packed >> 37n) & 0x1fn)
  const hour = Number((packed >> 32n) & 0x1fn)
  const minute = Number((packed >> 26n) & 0x3fn)
  const second = Number((packed >> 20n) & 0x3fn)
  const ms = Number((packed >> 10n) & 0x3ffn)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(ms, 3)}`
}
/* eslint-enable no-bitwise */

const decodeVoteOrMiningCounter = (
  _view: DataView,
  bytes: Uint8Array,
  isVote: boolean
): Record<string, unknown> => {
  const values = extract10BitValues(bytes.subarray(0, PACKED_DATA_SIZE), NUM_COMPUTORS)
  const dataLock = bytesToHex(bytes.subarray(PACKED_DATA_SIZE, PACKED_DATA_SIZE + DATA_LOCK_SIZE))
  const total = values.reduce((sum, v) => sum + v, 0)
  const nonZeroCount = values.filter((v) => v > 0).length

  return isVote
    ? { votes: values, dataLock, totalVotes: total, nonZeroCount }
    : { scores: values, dataLock, totalScore: total, nonZeroCount }
}

const decodeMiningSolution = (_view: DataView, bytes: Uint8Array): Record<string, unknown> => ({
  miningSeed: bytesToHex(bytes.subarray(0, 32)),
  nonce: bytesToHex(bytes.subarray(32, 64))
})

const decodeFileHeader = (view: DataView, bytes: Uint8Array): Record<string, unknown> => ({
  fileSize: formatByteSize(view.getBigUint64(0, true)),
  numberOfFragments: Number(view.getBigUint64(8, true)).toLocaleString('en-US'),
  fileFormat: readAscii(bytes, 16, 8)
})

const decodeFileFragment = (view: DataView, bytes: Uint8Array): Record<string, unknown> => ({
  fragmentIndex: view.getBigUint64(0, true).toString(),
  prevFragmentDigest: bytesToHex(bytes.subarray(8, 40)),
  payloadSize: formatByteSize(bytes.length - 40)
})

const decodeFileTrailer = (view: DataView, bytes: Uint8Array): Record<string, unknown> => ({
  fileSize: formatByteSize(view.getBigUint64(0, true)),
  numberOfFragments: Number(view.getBigUint64(8, true)).toLocaleString('en-US'),
  fileFormat: readAscii(bytes, 16, 8),
  lastFragmentDigest: bytesToHex(bytes.subarray(24, 56))
})

const decodeOracleReplyCommit = (view: DataView, bytes: Uint8Array): Record<string, unknown> => {
  const itemSize = 72
  const numItems = Math.floor(bytes.length / itemSize)
  const items = []
  for (let i = 0; i < numItems; i += 1) {
    const offset = i * itemSize
    items.push({
      queryId: view.getBigUint64(offset, true).toString(),
      replyDigest: bytesToHex(bytes.subarray(offset + 8, offset + 40)),
      knowledgeProof: bytesToHex(bytes.subarray(offset + 40, offset + 72))
    })
  }
  return { items }
}

const decodeOracleReplyReveal = (view: DataView, bytes: Uint8Array): Record<string, unknown> => {
  const replyDataSize = bytes.length - 8
  return {
    queryId: view.getBigUint64(0, true).toString(),
    replyDataSize: formatByteSize(replyDataSize),
    replyData: replyDataSize > 0 ? bytesToHex(bytes.subarray(8)) : null
  }
}

const decodeExecutionFeeReport = (view: DataView, bytes: Uint8Array): Record<string, unknown> => {
  const phaseNumber = view.getUint32(0, true)
  const numEntries = Math.min(view.getUint32(4, true), Math.floor((bytes.length - 8) / 12))

  const indicesStart = 8
  const indicesEnd = indicesStart + numEntries * 4
  const paddedIndicesEnd = numEntries % 2 !== 0 ? indicesEnd + 4 : indicesEnd
  const feesStart = paddedIndicesEnd

  const entries = []
  for (let i = 0; i < numEntries; i += 1) {
    const contractIndex = view.getUint32(indicesStart + i * 4, true)
    const executionFee =
      feesStart + i * 8 + 8 <= bytes.length
        ? view.getBigUint64(feesStart + i * 8, true).toString()
        : '0'
    entries.push({ contractIndex, executionFee })
  }

  const dataLockStart = feesStart + numEntries * 8
  const dataLock =
    dataLockStart + 32 <= bytes.length
      ? bytesToHex(bytes.subarray(dataLockStart, dataLockStart + 32))
      : undefined

  return { phaseNumber, numEntries, entries, ...(dataLock ? { dataLock } : {}) }
}

const ORACLE_PRICE_INTERFACE = 0
const ORACLE_MOCK_INTERFACE = 1

const decodeOracleUserQuery = (view: DataView, bytes: Uint8Array): Record<string, unknown> => {
  const oracleInterfaceIndex = view.getUint32(0, true)
  const timeoutMilliseconds = view.getUint32(4, true)

  const base: Record<string, unknown> = { oracleInterfaceIndex, timeoutMilliseconds }

  if (bytes.length <= 8) return base

  const queryBytes = bytes.subarray(8)

  if (oracleInterfaceIndex === ORACLE_PRICE_INTERFACE && queryBytes.length >= 104) {
    const oracle = readAscii(queryBytes, 0, 32)
    const timestampView = new DataView(queryBytes.buffer, queryBytes.byteOffset + 32, 8)
    const timestampPacked = timestampView.getBigUint64(0, true)
    const timestamp = decodeDateAndTime(timestampPacked)
    const currency1 = readAscii(queryBytes, 40, 32)
    const currency2 = readAscii(queryBytes, 72, 32)
    return { ...base, queryData: { oracle, timestamp, currency1, currency2 } }
  }

  if (oracleInterfaceIndex === ORACLE_MOCK_INTERFACE && queryBytes.length >= 8) {
    const queryView = new DataView(queryBytes.buffer, queryBytes.byteOffset, 8)
    const value = queryView.getBigUint64(0, true).toString()
    return { ...base, queryData: { value } }
  }

  return { ...base, queryData: bytesToHex(queryBytes) }
}

type DecoderFn = (view: DataView, bytes: Uint8Array) => Record<string, unknown>

const DECODERS: Record<number, DecoderFn> = {
  1: (view, bytes) => decodeVoteOrMiningCounter(view, bytes, true),
  2: decodeMiningSolution,
  3: decodeFileHeader,
  4: decodeFileFragment,
  5: decodeFileTrailer,
  6: decodeOracleReplyCommit,
  7: decodeOracleReplyReveal,
  8: (view, bytes) => decodeVoteOrMiningCounter(view, bytes, false),
  9: decodeExecutionFeeReport,
  10: decodeOracleUserQuery
}

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
): Uint8Array | null => {
  if (!inputData) return null
  if (inputData instanceof Uint8Array) return inputData
  if (Array.isArray(inputData)) return Uint8Array.from(inputData)
  if (typeof inputData !== 'string') return null
  try {
    return bytesFromBase64(inputData.trim())
  } catch {
    return null
  }
}

const getEntryName = (inputType: number, protocolData?: TransactionInputType[]): string =>
  protocolData?.find((t) => t.id === inputType)?.label ?? `Protocol Type ${inputType}`

export const decodeProtocolInputData = (
  inputType: number,
  inputData: string | Uint8Array | number[] | null | undefined,
  protocolData?: TransactionInputType[]
): DecodedContractInput => {
  const entryName = getEntryName(inputType, protocolData)

  if (inputType === 0) {
    return {
      status: 'decoded',
      contractName: 'Protocol',
      contractIndex: 0,
      entryName,
      kind: 'procedure',
      inputType: 0,
      value: {},
      identityPaths: new Set<string>(),
      decodeMode: 'typed'
    }
  }

  const decoder = DECODERS[inputType]
  if (!decoder) {
    return {
      status: 'unsupported',
      reason: 'no-match',
      message: `Unknown protocol input type ${inputType}`
    }
  }

  const bytes = toBytes(inputData)
  if (!bytes || bytes.length === 0) {
    return { status: 'unsupported', reason: 'missing-input-data' }
  }

  const minSize = MIN_SIZES[inputType]
  if (minSize && bytes.length < minSize) {
    return {
      status: 'unsupported',
      reason: 'invalid-input-data',
      message: `Expected at least ${minSize} bytes, got ${bytes.length}`
    }
  }

  try {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    const value = decoder(view, bytes)

    return {
      status: 'decoded',
      contractName: 'Protocol',
      contractIndex: 0,
      entryName,
      kind: 'procedure',
      inputType,
      value,
      identityPaths: new Set<string>(),
      decodeMode: 'typed'
    }
  } catch (error) {
    return {
      status: 'unsupported',
      reason: 'decode-failed',
      message: error instanceof Error ? error.message : String(error)
    }
  }
}
