import { useTranslation } from 'react-i18next'

interface FilterInputProps {
  id: string
  label: string
  value: string | undefined
  error?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  type?: string // Add type prop for input type
}

export default function FilterInput({
  id,
  label,
  value,
  error,
  onChange,
  onBlur,
  placeholder,
  type = 'text'
}: FilterInputProps) {
  const { t } = useTranslation('network-page')

  return (
    <div>
      <label htmlFor={id} className="mb-4 block text-sm text-gray-50">
        {t(label)}
      </label>
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full rounded bg-primary-60 px-12 py-8 text-sm text-white placeholder-gray-50 focus:outline-none focus:ring-2 ${
          error ? 'ring-2 ring-error-40' : 'focus:ring-primary-30'
        }`}
        placeholder={t(placeholder || '') || placeholder}
      />
      {error && <p className="mt-4 text-xs text-error-40">{error}</p>}
    </div>
  )
}
