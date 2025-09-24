import { Modal } from '@app/components/ui'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'

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

  // Reset filters when dialog opens with active filters
  useEffect(() => {
    setFilters(activeFilters)
  }, [activeFilters, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onApplyFilters(filters)
    onClose()
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
          <div>
            <label htmlFor="source" className="mb-4 block text-sm text-gray-50">
              {t('source')}
            </label>
            <input
              id="source"
              type="text"
              value={filters.source || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))}
              className="w-full rounded bg-primary-60 px-12 py-8 text-sm text-white placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-30"
              placeholder={t('enterSource') || 'Enter source address'}
            />
          </div>

          <div>
            <label htmlFor="destination" className="mb-4 block text-sm text-gray-50">
              {t('destination')}
            </label>
            <input
              id="destination"
              type="text"
              value={filters.destination || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, destination: e.target.value }))}
              className="w-full rounded bg-primary-60 px-12 py-8 text-sm text-white placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-30"
              placeholder={t('enterDestination') || 'Enter destination address'}
            />
          </div>

          <div>
            <label htmlFor="amount" className="mb-4 block text-sm text-gray-50">
              {t('amount')}
            </label>
            <input
              id="amount"
              type="text"
              value={filters.amount || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, amount: e.target.value }))}
              className="w-full rounded bg-primary-60 px-12 py-8 text-sm text-white placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-30"
              placeholder={t('enterAmount') || 'Enter amount'}
            />
          </div>

          <div>
            <label htmlFor="inputType" className="mb-4 block text-sm text-gray-50">
              {t('inputType')}
            </label>
            <input
              id="inputType"
              type="text"
              value={filters.inputType || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, inputType: e.target.value }))}
              className="w-full rounded bg-primary-60 px-12 py-8 text-sm text-white placeholder-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-30"
              placeholder={t('enterInputType') || 'Enter input type'}
            />
          </div>

          <div className="flex gap-8 pt-16">
            <button
              type="button"
              onClick={() => {
                setFilters({})
                onApplyFilters({})
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
