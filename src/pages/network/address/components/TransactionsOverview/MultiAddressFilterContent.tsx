import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PlusIcon, XmarkIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import type { AddressFilter, AddressFilterMode } from '../../hooks/useLatestTransactions'
import { MODE, validateAddresses } from './filterUtils'

const MAX_ADDRESSES = 5

const MODE_OPTIONS: { value: AddressFilterMode; labelKey: string }[] = [
  { value: MODE.INCLUDE, labelKey: 'include' },
  { value: MODE.EXCLUDE, labelKey: 'exclude' }
]

type Props = {
  id: string
  value: AddressFilter | undefined
  onChange: (value: AddressFilter | undefined) => void
  onApply: () => void
  placeholder?: string
  hint?: string
  showApplyButton?: boolean
  error?: string | null
}

export default function MultiAddressFilterContent({
  id,
  value,
  onChange,
  onApply,
  placeholder,
  hint,
  showApplyButton = true,
  error: externalError
}: Props) {
  const { t } = useTranslation('network-page')

  // Local state for editing - initialize with at least one empty address field
  const [localMode, setLocalMode] = useState<AddressFilterMode>(value?.mode ?? MODE.INCLUDE)
  const [localAddresses, setLocalAddresses] = useState<string[]>(
    value?.addresses && value.addresses.length > 0 ? value.addresses : ['']
  )
  const [internalErrors, setInternalErrors] = useState<(string | null)[]>([])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  // Stable IDs for each address input to avoid react/no-array-index-key
  const [addressIds, setAddressIds] = useState<number[]>(() =>
    (value?.addresses && value.addresses.length > 0 ? value.addresses : ['']).map((_, i) => i)
  )
  const nextIdRef = useRef(addressIds.length)

  // Sync local state when prop changes (e.g., when modal/dropdown opens)
  useEffect(() => {
    setLocalMode(value?.mode ?? MODE.INCLUDE)
    const addresses = value?.addresses && value.addresses.length > 0 ? value.addresses : ['']
    setLocalAddresses(addresses)
    setInternalErrors([])
    // Reset address IDs
    const newIds = addresses.map((_, i) => i)
    setAddressIds(newIds)
    nextIdRef.current = newIds.length
  }, [value])

  const handleModeChange = (mode: AddressFilterMode) => {
    setLocalMode(mode)
    // Update parent with new mode, keeping addresses
    const validAddresses = localAddresses.filter((addr) => addr.trim() !== '')
    onChange(
      validAddresses.length > 0 ? { mode, addresses: validAddresses } : { mode, addresses: [] }
    )
  }

  const handleAddressChange = (index: number, newValue: string) => {
    const uppercased = newValue.toUpperCase()
    const newAddresses = [...localAddresses]
    newAddresses[index] = uppercased
    setLocalAddresses(newAddresses)

    // Clear error for this field when user starts typing
    const newErrors = [...internalErrors]
    newErrors[index] = null
    setInternalErrors(newErrors)

    // Update parent with valid addresses
    const validAddresses = newAddresses.filter((addr) => addr.trim() !== '')
    onChange(
      validAddresses.length > 0
        ? { mode: localMode, addresses: validAddresses }
        : { mode: localMode, addresses: [] }
    )
  }

  const handleAddAddress = () => {
    if (localAddresses.length < MAX_ADDRESSES) {
      const newAddresses = [...localAddresses, '']
      setLocalAddresses(newAddresses)
      // Add a new stable ID
      const newId = nextIdRef.current
      nextIdRef.current += 1
      setAddressIds((prev) => [...prev, newId])
      // Focus the new input after render
      setTimeout(() => {
        inputRefs.current[newAddresses.length - 1]?.focus()
      }, 0)
    }
  }

  const handleRemoveAddress = (index: number) => {
    if (localAddresses.length <= 1) {
      // If only one address, clear it instead of removing
      setLocalAddresses([''])
      setInternalErrors([])
      // Reset to a single ID
      setAddressIds([nextIdRef.current])
      nextIdRef.current += 1
      onChange({ mode: localMode, addresses: [] })
      return
    }

    const newAddresses = localAddresses.filter((_, i) => i !== index)
    const newErrors = internalErrors.filter((_, i) => i !== index)
    const newIds = addressIds.filter((_, i) => i !== index)
    setLocalAddresses(newAddresses)
    setInternalErrors(newErrors)
    setAddressIds(newIds)

    // Update parent
    const validAddresses = newAddresses.filter((addr) => addr.trim() !== '')
    onChange(
      validAddresses.length > 0
        ? { mode: localMode, addresses: validAddresses }
        : { mode: localMode, addresses: [] }
    )
  }

  const handleApply = () => {
    // Validate all addresses using shared utility
    const { errors, hasError } = validateAddresses(localAddresses)

    if (hasError) {
      // Translate error keys to messages
      const translatedErrors = errors.map((e) => (e ? t(e) : null))
      setInternalErrors(translatedErrors)
      // Focus first error input
      const firstErrorIndex = errors.findIndex((e) => e !== null)
      if (firstErrorIndex >= 0) {
        inputRefs.current[firstErrorIndex]?.focus()
      }
      return
    }

    setInternalErrors([])
    onApply()
  }

  const canAddMore = localAddresses.length < MAX_ADDRESSES

  return (
    <div className="space-y-12">
      {/* Include/Exclude Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded border border-primary-60">
          {MODE_OPTIONS.map((option, index) => {
            const isSelected = localMode === option.value
            const isFirst = index === 0
            const isLast = index === MODE_OPTIONS.length - 1

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleModeChange(option.value)}
                className={clsxTwMerge(
                  'px-16 py-6 font-space text-xs font-medium transition duration-300',
                  isFirst && 'rounded-l',
                  isLast && 'rounded-r',
                  !isFirst && 'border-l border-primary-60',
                  isSelected
                    ? 'bg-primary-30 text-primary-80'
                    : 'text-gray-100 hover:bg-primary-60/60'
                )}
              >
                {t(option.labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Address Inputs */}
      <div className="space-y-8">
        {localAddresses.map((address, index) => (
          <div key={addressIds[index]}>
            <div className="relative">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                id={`${id}-address-${index}`}
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(index, e.target.value)}
                placeholder={placeholder || t('addressPlaceholder')}
                className={clsxTwMerge(
                  'w-full rounded bg-primary-60 px-10 py-6 text-base text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30 md:text-xs',
                  (index > 0 || address.trim() !== '') && 'pr-32',
                  internalErrors[index] && 'ring-1 ring-error-40'
                )}
              />
              {/* Show X button: always for additional fields (index > 0), or when first field has content */}
              {(index > 0 || address.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => handleRemoveAddress(index)}
                  className="absolute right-8 top-1/2 flex h-20 w-20 -translate-y-1/2 items-center justify-center rounded-full text-gray-50 hover:bg-primary-50 hover:text-white"
                  aria-label={t('removeAddress')}
                >
                  <XmarkIcon className="h-12 w-12" />
                </button>
              )}
            </div>
            {internalErrors[index] && (
              <p className="mt-4 text-xs text-red-400">{internalErrors[index]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Address Button */}
      {canAddMore && (
        <button
          type="button"
          onClick={handleAddAddress}
          className="flex w-full items-center justify-center gap-6 rounded border border-dashed border-primary-60 px-10 py-6 text-xs text-gray-50 transition-colors hover:border-primary-30 hover:text-white"
        >
          <PlusIcon className="h-12 w-12" />
          <span>{t('addAddress')}</span>
        </button>
      )}

      {/* Max addresses info */}
      {!canAddMore && (
        <p className="text-center text-xs text-gray-50">{t('maxAddressesReached')}</p>
      )}

      {/* External error */}
      {externalError && <p className="text-xs text-red-400">{externalError}</p>}

      {/* Hint */}
      {hint && <p className="text-xs italic text-gray-50">*{hint}</p>}

      {/* Apply Button */}
      {showApplyButton && (
        <button
          type="button"
          onClick={handleApply}
          className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40"
        >
          {t('filterButton')}
        </button>
      )}
    </div>
  )
}
