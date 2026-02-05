import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  id: string
  value: string | undefined
  onChange: (value: string | undefined) => void
  onApply: () => void
  placeholder?: string
  error?: string | null
  showApplyButton?: boolean
}

export default function AddressFilterContent({
  id,
  value,
  onChange,
  onApply,
  placeholder,
  error,
  showApplyButton = true
}: Props) {
  const { t } = useTranslation('network-page')

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.toUpperCase()
      onChange(newValue || undefined)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onApply()
      }
    },
    [onApply]
  )

  return (
    <div className="flex flex-col gap-8">
      <input
        id={id}
        type="text"
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('addressPlaceholder')}
        className="w-full rounded border border-primary-60 bg-primary-70 px-10 py-8 font-space text-xs text-white placeholder:text-gray-50 focus:border-primary-30 focus:outline-none"
        autoComplete="off"
        spellCheck={false}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {showApplyButton && (
        <button
          type="button"
          onClick={onApply}
          className="mt-4 w-full rounded bg-primary-30 px-12 py-8 text-xs font-medium text-primary-80 hover:bg-primary-40"
        >
          {t('filterButton')}
        </button>
      )}
    </div>
  )
}
