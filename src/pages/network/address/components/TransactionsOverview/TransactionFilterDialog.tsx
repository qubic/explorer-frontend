import { Modal } from '@app/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'
import FilterInput from './FilterInput'

interface ValidationErrors {
  source?: string
  destination?: string
  amount?: string
  inputType?: string
  tickNumberStart?: string
  tickNumberEnd?: string
}

const defaultFilters: TransactionFilters = {
  source: undefined,
  destination: undefined,
  amount: undefined,
  inputType: undefined,
  tickNumberRange: undefined
}

// Validation helpers
const isValidAddress = (value?: string): boolean => !value || value.length >= 60
const isValidNumber = (value?: string): boolean => !value || /^\d+$/.test(value)
const isValidTickNumber = (start?: string, end?: string): boolean => {
  if (!start && !end) return true
  if (start && !isValidNumber(start)) return false
  if (end && !isValidNumber(end)) return false
  if (start && end && Number(start) > Number(end)) return false
  return true
}

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

  const validateField = useCallback(
    (field: keyof ValidationErrors, value?: string): string | undefined => {
      if (!value) return undefined

      switch (field) {
        case 'source':
        case 'destination':
          return !isValidAddress(value)
            ? t(`${field}Validation`) || `${field} address must be at least 60 characters`
            : undefined
        case 'amount':
        case 'inputType':
          return !isValidNumber(value)
            ? t(`${field}Validation`) || `${field} must be a valid number`
            : undefined
        case 'tickNumberStart':
        case 'tickNumberEnd':
          if (!isValidNumber(value)) {
            return t('invalidTickNumber') || 'Invalid tick number'
          }
          if (
            !isValidTickNumber(
              field === 'tickNumberStart' ? value : filters.tickNumberRange?.start,
              field === 'tickNumberEnd' ? value : filters.tickNumberRange?.end
            )
          ) {
            return (
              t('invalidTickNumberRange') || 'Start tick must be less than or equal to end tick'
            )
          }
          return undefined
        default:
          return undefined
      }
    },
    [t, filters.tickNumberRange]
  )

  const validateFilters = useCallback((): boolean => {
    const newErrors: ValidationErrors = {
      source: validateField('source', filters.source),
      destination: validateField('destination', filters.destination),
      amount: validateField('amount', filters.amount),
      inputType: validateField('inputType', filters.inputType),
      tickNumberStart: validateField('tickNumberStart', filters.tickNumberRange?.start),
      tickNumberEnd: validateField('tickNumberEnd', filters.tickNumberRange?.end)
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== undefined)
    ) as ValidationErrors

    setErrors(filteredErrors)
    return Object.keys(filteredErrors).length === 0
  }, [filters, validateField])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateFilters()) {
      onApplyFilters(filters)
      onClose()
    }
  }

  return (
    <Modal
      id="transaction-filter-modal"
      isOpen={isOpen}
      className="fixed inset-x-0 top-1/4 mx-auto max-w-md"
      closeOnOutsideClick
      onClose={onClose}
    >
      <div className="rounded-lg bg-primary-70 p-24">
        <div className="mb-16 flex items-center justify-between">
          <h3 className="font-space text-lg font-500">{t('filterTransactions')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-50 hover:text-gray-100"
            aria-label={t('close') || 'Close'}
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
            id="amount"
            label="amount"
            value={filters.amount}
            error={errors.amount}
            placeholder="enterAmount"
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, amount: value }))
              setErrors((prev) => ({ ...prev, amount: undefined }))
            }}
            onBlur={() => {
              const error = validateField('amount', filters.amount)
              setErrors((prev) => ({ ...prev, amount: error }))
            }}
          />

          <div className="space-y-0">
            <label htmlFor="tickNumberStart" className="mb-4 block text-sm text-gray-50">
              {t('tickNumber')}
            </label>
            <div className="flex gap-8">
              <div className="flex-1">
                <FilterInput
                  id="tickNumberStart"
                  label=""
                  value={filters.tickNumberRange?.start}
                  error={errors.tickNumberStart}
                  placeholder={t('startTick') || 'Start tick'}
                  onChange={(value) => {
                    setFilters((prev) => ({
                      ...prev,
                      tickNumberRange: { ...prev.tickNumberRange, start: value }
                    }))
                    setErrors((prev) => ({ ...prev, tickNumberStart: undefined }))
                  }}
                  onBlur={() => {
                    if (
                      !isValidTickNumber(
                        filters.tickNumberRange?.start,
                        filters.tickNumberRange?.end
                      )
                    ) {
                      setErrors((prev) => ({
                        ...prev,
                        tickNumberStart: t('invalidTickNumberRange') || 'Invalid tick number range'
                      }))
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <FilterInput
                  id="tickNumberEnd"
                  label=""
                  value={filters.tickNumberRange?.end}
                  error={errors.tickNumberEnd}
                  placeholder={t('endTick') || 'End tick'}
                  onChange={(value) => {
                    setFilters((prev) => ({
                      ...prev,
                      tickNumberRange: { ...prev.tickNumberRange, end: value }
                    }))
                    setErrors((prev) => ({ ...prev, tickNumberEnd: undefined }))
                  }}
                  onBlur={() => {
                    if (
                      !isValidTickNumber(
                        filters.tickNumberRange?.start,
                        filters.tickNumberRange?.end
                      )
                    ) {
                      setErrors((prev) => ({
                        ...prev,
                        tickNumberEnd: t('invalidTickNumberRange') || 'Invalid tick number range'
                      }))
                    }
                  }}
                />
              </div>
            </div>
          </div>

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

          <div className="flex gap-8 pt-16">
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
