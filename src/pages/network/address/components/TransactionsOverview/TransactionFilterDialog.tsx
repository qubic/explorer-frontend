import { Modal } from '@app/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'
import FilterInput from './FilterInput'

interface ValidationErrors {
  source?: string
  destination?: string
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

const isValidAddress = (value?: string): boolean => !value || value.length === 60
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

  useEffect(() => {
    setFilters(activeFilters)
    setErrors({})
  }, [activeFilters, isOpen])

  const validateField = useCallback(
    (field: keyof ValidationErrors, value?: string): string | undefined => {
      if (!value) return undefined

      const validateAmountRange = (
        rangeField: 'amountStart' | 'amountEnd',
        rangeValue: string,
        otherValue: string | undefined,
        translate: (key: string) => string
      ): string | undefined => {
        if (!isValidNumber(rangeValue)) {
          return translate('invalidValue')
        }

        if (otherValue) {
          const currentVal = Number(rangeValue)
          const otherVal = Number(otherValue)
          const isStartField = rangeField === 'amountStart'

          if ((isStartField && currentVal > otherVal) || (!isStartField && currentVal < otherVal)) {
            return translate('invalidRangeAmount')
          }
        }

        return undefined
      }

      const validateRangeField = (
        fieldType: 'tickNumberStart' | 'tickNumberEnd' | 'dateStart' | 'dateEnd',
        inputValue: string,
        otherValue: string | undefined,
        translate: (key: string) => string
      ): string | undefined => {
        const isTickField = fieldType.includes('tick')
        const isDateField = fieldType.includes('date')
        const isStartField = fieldType.includes('Start')

        if (isTickField && !isValidNumber(inputValue)) {
          return translate('invalidValue')
        }

        if (isDateField && (!inputValue || Number.isNaN(new Date(inputValue).getTime()))) {
          return translate('invalidValue')
        }

        if (otherValue) {
          const currentVal = isDateField ? new Date(inputValue).getTime() : Number(inputValue)
          const otherVal = isDateField ? new Date(otherValue).getTime() : Number(otherValue)

          if (
            (isStartField && currentVal >= otherVal) ||
            (!isStartField && currentVal <= otherVal)
          ) {
            return translate('invalidRange')
          }
        }

        return undefined
      }

      switch (field) {
        case 'source':
        case 'destination':
          return !isValidAddress(value) ? t(`addressValidation`) : undefined
        case 'inputType':
          return !isValidNumber(value) ? t(`invalidValue`) : undefined
        case 'amountStart':
        case 'amountEnd':
          return validateAmountRange(
            field,
            value,
            field === 'amountStart' ? filters.amountRange?.end : filters.amountRange?.start,
            t
          )
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
    [t, filters]
  )

  const validateFilters = useCallback((): boolean => {
    const newErrors: ValidationErrors = {
      source: validateField('source', filters.source),
      destination: validateField('destination', filters.destination),
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
