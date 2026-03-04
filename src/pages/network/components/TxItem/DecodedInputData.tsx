import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { DecodedContractInput } from '@app/utils/contract-input-decoder'

type FlatRow = Readonly<{ key: string; value: string }>
const MAX_DECODED_FLATTEN_DEPTH = 20

const toDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined) return '--'
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Uint8Array) {
    const hex = Array.from(value)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
    return `0x${hex}`
  }

  try {
    return JSON.stringify(value, (_, nestedValue) =>
      typeof nestedValue === 'bigint' ? nestedValue.toString() : nestedValue
    )
  } catch {
    return String(value)
  }
}

const flattenDecodedValue = (
  value: unknown,
  path = '',
  depth = 0,
  seen?: WeakSet<object>
): FlatRow[] => {
  if (depth > MAX_DECODED_FLATTEN_DEPTH) {
    return [{ key: path || 'value', value: '[Max depth exceeded]' }]
  }

  if (Array.isArray(value)) {
    const localSeen = seen ?? new WeakSet<object>()
    if (localSeen.has(value)) {
      return [{ key: path || 'value', value: '[Circular]' }]
    }
    localSeen.add(value)

    return value.flatMap((item, index) =>
      flattenDecodedValue(item, path ? `${path}[${index}]` : `[${index}]`, depth + 1, localSeen)
    )
  }

  if (value && typeof value === 'object' && !(value instanceof Uint8Array)) {
    const localSeen = seen ?? new WeakSet<object>()
    if (localSeen.has(value)) {
      return [{ key: path || 'value', value: '[Circular]' }]
    }
    localSeen.add(value)

    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
      flattenDecodedValue(nested, path ? `${path}.${key}` : key, depth + 1, localSeen)
    )
  }

  return [{ key: path || 'value', value: toDisplayValue(value) }]
}

const humanizeSegment = (segment: string): string =>
  segment
    .replace(/\[(\d+)\]/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())

const humanizePath = (path: string): string =>
  path
    .split('.')
    .map((segment) => humanizeSegment(segment))
    .join(' / ')

type Props = {
  readonly decoded: DecodedContractInput
}

export default function DecodedInputData({ decoded }: Props) {
  const { t } = useTranslation('network-page')
  const rows = useMemo(
    () => (decoded.status === 'decoded' ? flattenDecodedValue(decoded.value) : []),
    [decoded]
  )

  if (decoded.status !== 'decoded') {
    return <p className="font-space text-sm text-gray-50">{t('decodedDataUnavailable')}</p>
  }

  return (
    <div className="flex w-full flex-col gap-8 rounded-8 bg-primary-60 p-12">
      <div className="flex items-center gap-8 text-xs">
        <span className="text-gray-50">{t('decodedDataContractEntry')}</span>
        <span className="rounded-8 border border-gray-50 px-8 py-2 font-space text-white">
          {decoded.contractName}.{decoded.entryName}
        </span>
      </div>
      <div className="flex flex-col gap-6">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[minmax(130px,auto)_1fr] items-start gap-8">
            <span className="font-space text-xs text-gray-50">{humanizePath(row.key)}</span>
            <span className="break-all font-space text-sm text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
