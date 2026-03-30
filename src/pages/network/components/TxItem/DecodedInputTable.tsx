import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { COPY_BUTTON_TYPES, CopyTextButton } from '@app/components/ui/buttons'
import { Routes } from '@app/router'
import type { DecodedContractInput } from '@app/utils/contract-input-decoder'
import { formatString } from '@app/utils'

const stripArrayIndices = (path: string): string => path.replace(/\[\d+\]/g, '')

type ValueType = 'address' | 'numeric' | 'hex' | 'boolean' | 'text'

type FlatRow = Readonly<{ key: string; value: string; valueType: ValueType }>

const MAX_FLATTEN_DEPTH = 20
const MONOSPACE_VALUE_MIN_LENGTH = 24
const DECIMAL_STRING = /^-?\d+$/

const formatNumericValue = (value: string): string => {
  const isNegative = value.startsWith('-')
  const digits = isNegative ? value.slice(1) : value
  const parts: string[] = []
  let remaining = digits
  while (remaining.length > 3) {
    parts.unshift(remaining.slice(-3))
    remaining = remaining.slice(0, -3)
  }
  parts.unshift(remaining)
  return `${isNegative ? '-' : ''}${parts.join(',')}`
}

const getValueType = (value: unknown, isAddress: boolean): ValueType => {
  if (isAddress) return 'address'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'bigint' || typeof value === 'number') return 'numeric'
  if (typeof value === 'string') {
    if (DECIMAL_STRING.test(value)) return 'numeric'
    if (value.startsWith('0x')) return 'hex'
  }
  if (value instanceof Uint8Array) return 'hex'
  return 'text'
}

const isZeroByteArray = (value: readonly unknown[]): boolean =>
  value.length > 0 &&
  value.every((item) => Number.isInteger(item) && Number(item) >= 0 && Number(item) <= 255) &&
  value.every((item) => Number(item) === 0)

const toDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined) return '--'
  if (typeof value === 'bigint') return value.toLocaleString('en-US')
  if (typeof value === 'string') return value
  if (typeof value === 'number') return formatString(value)
  if (typeof value === 'boolean') return String(value)
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
  identityPaths: ReadonlySet<string>,
  path = '',
  depth = 0,
  seen: WeakSet<object> = new WeakSet()
): FlatRow[] => {
  if (depth > MAX_FLATTEN_DEPTH) {
    return [{ key: path || 'value', value: '[Max depth exceeded]', valueType: 'text' }]
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return [{ key: path || 'value', value: '[Circular]', valueType: 'text' }]
    }
    seen.add(value)
    if (isZeroByteArray(value)) {
      return [
        { key: path || 'value', value: `[all zeros: ${value.length} bytes]`, valueType: 'text' }
      ]
    }
    return value.flatMap((item, index) =>
      flattenDecodedValue(
        item,
        identityPaths,
        path ? `${path}[${index}]` : `[${index}]`,
        depth + 1,
        seen
      )
    )
  }

  if (value && typeof value === 'object' && !(value instanceof Uint8Array)) {
    if (seen.has(value)) {
      return [{ key: path || 'value', value: '[Circular]', valueType: 'text' }]
    }
    seen.add(value)
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
      flattenDecodedValue(nested, identityPaths, path ? `${path}.${key}` : key, depth + 1, seen)
    )
  }

  const isAddress = identityPaths.has(stripArrayIndices(path))
  const valueType = getValueType(value, isAddress)
  return [{ key: path || 'value', value: toDisplayValue(value), valueType }]
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

const shouldUseMonospaceValue = (value: string, valueType: ValueType): boolean => {
  if (value.length < MONOSPACE_VALUE_MIN_LENGTH) return false
  if (valueType === 'hex' || valueType === 'address') return true
  if (/^[a-zA-Z0-9+/=]{24,}$/.test(value)) return true
  return false
}

type Props = {
  readonly decoded: DecodedContractInput & { status: 'decoded' }
}

export default function DecodedInputTable({ decoded }: Props) {
  const rows = useMemo(
    () => flattenDecodedValue(decoded.value, decoded.identityPaths),
    [decoded.value, decoded.identityPaths]
  )

  return (
    <div className="min-w-0 flex-1">
      <dl className="divide-y divide-gray-60 pl-10">
        {rows.map((row) => {
          const displayValue =
            row.valueType === 'numeric' ? formatNumericValue(row.value) : row.value
          return (
            <div
              key={`${row.key}:${row.value}`}
              className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-[minmax(180px,220px)_1fr] sm:gap-10"
            >
              <dt className="font-space text-xs leading-5 tracking-wide text-gray-50">
                {humanizePath(row.key)}
              </dt>
              <dd
                className={
                  shouldUseMonospaceValue(displayValue, row.valueType)
                    ? 'break-all font-space text-sm text-white'
                    : 'break-words font-space text-sm text-white'
                }
              >
                {row.valueType === 'address' ? (
                  <span className="flex items-center gap-8">
                    <Link
                      className="text-primary-30"
                      to={Routes.NETWORK.ADDRESS(row.value)}
                      state={{ skipValidation: true }}
                    >
                      {row.value}
                    </Link>
                    <CopyTextButton text={row.value} type={COPY_BUTTON_TYPES.ADDRESS} />
                  </span>
                ) : (
                  displayValue
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
