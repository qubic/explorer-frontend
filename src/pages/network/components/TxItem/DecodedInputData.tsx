import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { DecodedContractInput } from '@app/utils/contract-input-decoder'

type FlatRow = Readonly<{ key: string; value: string }>
const MAX_DECODED_FLATTEN_DEPTH = 20
const MONOSPACE_VALUE_MIN_LENGTH = 24

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
    .replace(/\[(\d+)\]/g, ' item $1')
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

const shouldUseMonospaceValue = (value: string): boolean => {
  if (value.length < MONOSPACE_VALUE_MIN_LENGTH) return false
  if (value.startsWith('0x')) return true
  if (/^[A-Z]{50,70}$/.test(value)) return true
  if (/^[a-zA-Z0-9+/=]{24,}$/.test(value)) return true
  return false
}

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
    <div className="min-w-0 flex-1">
      <p className="mb-8 font-space text-xs text-gray-50">
        {t('decodedDataContractEntry')}:{' '}
        <span className="text-primary-30">
          {decoded.contractName}.{decoded.entryName}
        </span>
      </p>
      <dl className="divide-y divide-primary-60">
        {rows.map((row) => (
          <div
            key={`${row.key}:${row.value}`}
            className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-[minmax(180px,220px)_1fr] sm:gap-10"
          >
            <dt className="font-space text-xs leading-5 tracking-wide text-gray-50">
              {humanizePath(row.key)}
            </dt>
            <dd
              className={
                shouldUseMonospaceValue(row.value)
                  ? 'break-all font-mono text-sm text-white'
                  : 'break-words font-space text-sm text-white'
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
