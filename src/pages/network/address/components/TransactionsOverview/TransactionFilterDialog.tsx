import { Modal } from '@app/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'
import FilterInput from './FilterInput'

interface ValidationErrors {
  source?: string
  destination?: string
  amount?: string
  amountStart?: string
  amountEnd?: string
  inputType?: string
  tickNumberStart?: string
  tickNumberEnd?: string
  dateStart?: string
  dateEnd?: string
}

const defaultFilters: TransactionFilters = {
  source: undefined,
  destination: undefined,
  amount: undefined,
  amountRange: undefined,
  inputType: undefined,
  tickNumberRange: undefined,
  dateRange: undefined
}

// Validation helpers
const isValidAddress = (value?: string): boolean => !value || value.length >= 60
const isValidNumber = (value?: string): boolean => !value || /^\d+$/.test(value)

type Props = {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: TransactionFilters) => void
  activeFilters: TransactionFilters
}

export default function TransactionFilterDialog({
  isOpen,
  onClose,
  onApplyFilters,
  activeFilters
}: Props) {
  const { t } = useTranslation('network-page')
  const [filters, setFilters] = useState<TransactionFilters>(activeFilters)
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Reset filters and errors when dialog opens with active filters
  useEffect(() => {
    setFilters(activeFilters)
    setErrors({})
  }, [activeFilters, isOpen])

  const validateRangeField = (
    field:
      | 'tickNumberStart'
      | 'tickNumberEnd'
      | 'dateStart'
      | 'dateEnd'
      | 'amountStart'
      | 'amountEnd',
    value: string,
    otherValue: string | undefined,
    translate: (key: string) => string
  ): string | undefined => {
    const isTickField = field.includes('tick')
    const isAmountField = field.includes('amount')
    const isDateField = field.includes('date')
    const isStartField = field.includes('Start')

    if (isTickField && !isValidNumber(value)) {
      return translate('invalidValue')
    }

    if (isAmountField && !isValidNumber(value)) {
      return translate('invalidValue')
    }

    if (isDateField && (!value || Number.isNaN(new Date(value).getTime()))) {
      return translate('invalidValue')
    }

    // Range validation
    if (otherValue) {
      const currentVal = isDateField ? new Date(value).getTime() : Number(value)
      const otherVal = isDateField ? new Date(otherValue).getTime() : Number(otherValue)

      if ((isStartField && currentVal >= otherVal) || (!isStartField && currentVal <= otherVal)) {
        return translate('invalidRange')
      }
    }

    return undefined
  }

  const validateField = useCallback(
    (field: keyof ValidationErrors, value?: string): string | undefined => {
      if (!value) return undefined

      switch (field) {
        case 'source':
        case 'destination':
          return !isValidAddress(value)
            ? t(`${field}Validation`) || `${field} address must be at least 60 characters`
            : undefined
        case 'inputType':
          return !isValidNumber(value)
            ? t(`${field}Validation`) || `${field} must be a valid number`
            : undefined
        case 'tickNumberStart':
        case 'tickNumberEnd':
          return validateRangeField(
            field,
            value,
            field === 'tickNumberStart'
              ? filters.tickNumberRange?.end
              : filters.tickNumberRange?.start,
            t
          )
        case 'amountStart':
        case 'amountEnd':
          return validateRangeField(
            field,
            value,
            field === 'amountStart' ? filters.amountRange?.end : filters.amountRange?.start,
            t
          )
        case 'dateStart':
        case 'dateEnd':
          return validateRangeField(
            field,
            value,
            field === 'dateStart' ? filters.dateRange?.end : filters.dateRange?.start,
            t
          )
        default:
          return undefined
      }
    },
    [t, filters, validateRangeField]
  )

  const validateFilters = useCallback((): boolean => {
    const newErrors: ValidationErrors = {
      source: validateField('source', filters.source),
      destination: validateField('destination', filters.destination),
      amount: validateField('amount', filters.amount),
      amountStart: validateField('amountStart', filters.amountRange?.start),
      amountEnd: validateField('amountEnd', filters.amountRange?.end),
      inputType: validateField('inputType', filters.inputType),
      tickNumberStart: validateField('tickNumberStart', filters.tickNumberRange?.start),
      tickNumberEnd: validateField('tickNumberEnd', filters.tickNumberRange?.end),
      dateStart: validateField('dateStart', filters.dateRange?.start),
      dateEnd: validateField('dateEnd', filters.dateRange?.end)
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== undefined)
    ) as ValidationErrors

    setErrors(filteredErrors)
    return Object.keys(filteredErrors).length === 0
  }, [filters, validateField])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const hasAnyFilter =
      filters.source ||
      filters.destination ||
      filters.amount ||
      filters.inputType ||
      filters.tickNumberRange?.start ||
      filters.tickNumberRange?.end ||
      filters.dateRange?.start ||
      filters.dateRange?.end ||
      filters.amountRange?.start ||
      filters.amountRange?.end

    if (!hasAnyFilter) {
      onClose()
      return
    }

    if (validateFilters()) {
      onApplyFilters(filters)
      onClose()
    }
  }

  return (
    <Modal
      id="transaction-filter-modal"
      isOpen={isOpen}
      className="fixed inset-0 flex items-center justify-center"
      closeOnOutsideClick
      onClose={onClose}
    >
      <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-primary-70 p-24">
        <div className="z-10 -mx-24 -mt-4 mb-16 flex items-center justify-between bg-primary-70 px-24 py-4">
          <h3 className="font-space text-lg font-500">{t('filterTransactions')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-50 hover:text-gray-100"
            aria-label={t('close')}
          >
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-16">
          <FilterInput
            id="source"
            label="source"
            value={filters.source}
            error={errors.source}
            placeholder="enterSource"
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, source: value }))
              setErrors((prev) => ({ ...prev, source: undefined }))
            }}
            onBlur={() => {
              const error = validateField('source', filters.source)
              setErrors((prev) => ({ ...prev, source: error }))
            }}
          />

          <FilterInput
            id="destination"
            label="destination"
            value={filters.destination}
            error={errors.destination}
            placeholder="enterDestination"
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, destination: value }))
              setErrors((prev) => ({ ...prev, destination: undefined }))
            }}
            onBlur={() => {
              const error = validateField('destination', filters.destination)
              setErrors((prev) => ({ ...prev, destination: error }))
            }}
          />

          <FilterInput
            id="inputType"
            label="inputType"
            value={filters.inputType}
            error={errors.inputType}
            placeholder="enterInputType"
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, inputType: value }))
              setErrors((prev) => ({ ...prev, inputType: undefined }))
            }}
            onBlur={() => {
              const error = validateField('inputType', filters.inputType)
              setErrors((prev) => ({ ...prev, inputType: error }))
            }}
          />

          <div className="grid grid-cols-2 gap-16">
            <FilterInput
              id="amountStart"
              label="startAmount"
              value={filters.amountRange?.start}
              error={errors.amountStart}
              placeholder="enterStartAmount"
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, start: value }
                }))
                setErrors((prev) => ({ ...prev, amountStart: undefined }))
              }}
              onBlur={() => {
                const error = validateField('amountStart', filters.amountRange?.start)
                setErrors((prev) => ({ ...prev, amountStart: error }))
              }}
            />

            <FilterInput
              id="amountEnd"
              label="endAmount"
              value={filters.amountRange?.end}
              error={errors.amountEnd}
              placeholder="enterEndAmount"
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, end: value }
                }))
                setErrors((prev) => ({ ...prev, amountEnd: undefined }))
              }}
              onBlur={() => {
                const error = validateField('amountEnd', filters.amountRange?.end)
                setErrors((prev) => ({ ...prev, amountEnd: error }))
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-16">
            <FilterInput
              id="dateStart"
              label={t('startDate')}
              type="datetime-local"
              value={filters.dateRange?.start}
              error={errors.dateStart}
              placeholder={t('startDate')}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: value }
                }))
                setErrors((prev) => ({ ...prev, dateStart: undefined }))
              }}
              onBlur={() => {
                const error = validateField('dateStart', filters.dateRange?.start)
                setErrors((prev) => ({ ...prev, dateStart: error }))
              }}
            />
            <FilterInput
              id="dateEnd"
              label={t('endDate')}
              type="datetime-local"
              value={filters.dateRange?.end}
              error={errors.dateEnd}
              placeholder={t('endDate')}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: value }
                }))
                setErrors((prev) => ({ ...prev, dateEnd: undefined }))
              }}
              onBlur={() => {
                const error = validateField('dateEnd', filters.dateRange?.end)
                setErrors((prev) => ({ ...prev, dateEnd: error }))
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-16">
            <FilterInput
              id="tickNumberStart"
              label={t('startTick')}
              value={filters.tickNumberRange?.start}
              error={errors.tickNumberStart}
              placeholder={t('startTick')}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  tickNumberRange: { ...prev.tickNumberRange, start: value }
                }))
                setErrors((prev) => ({ ...prev, tickNumberStart: undefined }))
              }}
              onBlur={() => {
                const error = validateField('tickNumberStart', filters.tickNumberRange?.start)
                setErrors((prev) => ({ ...prev, tickNumberStart: error }))
              }}
            />
            <FilterInput
              id="tickNumberEnd"
              label={t('endTick')}
              value={filters.tickNumberRange?.end}
              error={errors.tickNumberEnd}
              placeholder={t('endTick')}
              onChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  tickNumberRange: { ...prev.tickNumberRange, end: value }
                }))
                setErrors((prev) => ({ ...prev, tickNumberEnd: undefined }))
              }}
              onBlur={() => {
                const error = validateField('tickNumberEnd', filters.tickNumberRange?.end)
                setErrors((prev) => ({ ...prev, tickNumberEnd: error }))
              }}
            />
          </div>
          <div className="sticky bottom-0 z-10 -mx-24 flex gap-8 bg-primary-70 px-24 py-16 pt-16">
            <button
              type="button"
              onClick={() => {
                setFilters(defaultFilters)
                onApplyFilters(defaultFilters)
                onClose()
              }}
              className="flex-1 rounded border border-primary-30 px-16 py-8 text-sm text-primary-30 transition-colors hover:bg-primary-60"
            >
              {t('clearAllFilters')}
            </button>
            <button
              type="submit"
              className="flex-1 rounded bg-primary-30 px-16 py-8 text-sm text-primary-80 transition-colors hover:bg-primary-40"
            >
              {t('applyFilters')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
