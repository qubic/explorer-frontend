import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isValidAddressFormat } from '@app/utils'

type Props = {
  id: string
  value: string | undefined
  onChange: (value: string | undefined) => void
  onApply: () => void
  placeholder?: string
  hint?: string
  showApplyButton?: boolean
  error?: string | null
}

export default function AddressFilterContent({
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
  const [localValue, setLocalValue] = useState(value || '')
  const [internalError, setInternalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use external error if provided, otherwise use internal error
  const error = externalError ?? internalError

  // Sync local value when prop changes (e.g., when modal/dropdown opens)
  // Don't validate on sync - only validate when user clicks Filter
  useEffect(() => {
    setLocalValue(value || '')
    setInternalError(null)
  }, [value])

  const handleChange = (newValue: string) => {
    // Convert to uppercase as user types
    const uppercased = newValue.toUpperCase()
    setLocalValue(uppercased)
    onChange(uppercased || undefined)
    // Clear any previous error when user starts typing
    setInternalError(null)
  }

  const handleApply = () => {
    // Validate only when applying
    if (localValue && !isValidAddressFormat(localValue)) {
      setInternalError(t('invalidAddressFormat'))
      // Focus back on the input field
      inputRef.current?.focus()
      return
    }
    setInternalError(null)
    onApply()
  }

  return (
    <div className="space-y-12">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder || t('addressPlaceholder')}
        className="w-full rounded bg-primary-60 px-10 py-6 text-xs text-white placeholder-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-30"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && <p className="text-xs italic text-gray-50">*{hint}</p>}
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
