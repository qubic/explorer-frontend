import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InfiniteScroll } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import type { QueryServiceTransaction } from '@app/store/apis/query-service/query-service.types'
import { TxItem } from '../../../components'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'
import TransactionFilterDialog from './TransactionFilterDialog'

type Props = {
  addressId: string
  transactions: QueryServiceTransaction[]
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
  onApplyFilters: (filters: TransactionFilters) => void
  onClearFilters: () => void
  activeFilters: TransactionFilters
}

export default function LatestTransactions({
  addressId,
  transactions,
  loadMore,
  hasMore,
  isLoading,
  error,
  onApplyFilters,
  onClearFilters,
  activeFilters
}: Props) {
  const { t } = useTranslation('network-page')
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  // Import the new TransactionFilterDialog component
  const handleCloseFilter = () => {
    setIsFilterDialogOpen(false)
  }

  const renderTxItem = useCallback(
    (tx: QueryServiceTransaction) => (
      <TxItem
        key={tx.hash}
        tx={{
          txId: tx.hash,
          sourceId: tx.source,
          destId: tx.destination,
          amount: tx.amount,
          tickNumber: tx.tickNumber,
          inputType: tx.inputType,
          inputHex: tx.inputData
        }}
        identity={addressId}
        variant="primary"
        nonExecutedTxIds={tx.moneyFlew ? [] : [tx.hash]}
        timestamp={tx.timestamp}
      />
    ),
    [addressId]
  )

  const hasActiveFilters = Object.entries(activeFilters).some(([key, value]) => {
    if (key === 'tickNumberRange' || key === 'dateRange') {
      return value && (value.start || value.end)
    }
    return typeof value === 'string' && value.trim() !== ''
  })

  const activeFilterCount = Object.entries(activeFilters).filter(([key, value]) => {
    if (key === 'tickNumberRange') {
      return value && (value.start || value.end)
    }
    return typeof value === 'string' && value.trim() !== ''
  }).length

  return (
    <>
      <div className="mb-16 flex items-center">
        <div className="ml-auto flex items-center gap-8">
          <button
            type="button"
            onClick={() => setIsFilterDialogOpen(true)}
            className="inline-flex items-center gap-8 rounded border border-primary-30 bg-transparent px-12 py-8 text-sm text-primary-30 transition-colors hover:bg-primary-60"
          >
            <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              />
            </svg>
            {t('filterTransactions')}
            {activeFilterCount > 0 && (
              <span className="flex h-20 min-w-20 items-center justify-center rounded-full bg-primary-75 px-8 text-xs text-primary-30">
                {activeFilterCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm text-gray-50 hover:text-white hover:underline"
            >
              {t('clearAllFilters')}
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-16 rounded bg-primary-75 p-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8 text-sm text-primary-30">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {t('filtersActive', { count: activeFilterCount }) ||
                `${activeFilterCount} filter(s) active`}
            </div>
            <div className="flex flex-wrap gap-8">
              {activeFilters.source && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('source')}: {activeFilters.source.slice(0, 8)}...
                </span>
              )}
              {activeFilters.destination && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('destination')}: {activeFilters.destination.slice(0, 8)}...
                </span>
              )}
              {activeFilters.amountRange?.start && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('startAmount')}: {activeFilters.amountRange.start}
                </span>
              )}
              {activeFilters.amountRange?.end && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('endAmount')}: {activeFilters.amountRange.end}
                </span>
              )}
              {activeFilters.inputType && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('inputType')}: {activeFilters.inputType}
                </span>
              )}
              {activeFilters.tickNumberRange?.start && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('startTick')}: {activeFilters.tickNumberRange.start}
                </span>
              )}
              {activeFilters.tickNumberRange?.end && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('endTick')}: {activeFilters.tickNumberRange.end}
                </span>
              )}
              {activeFilters.dateRange?.start && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('startDate')}: {new Date(activeFilters.dateRange.start).toLocaleString()}
                </span>
              )}
              {activeFilters.dateRange?.end && (
                <span className="rounded bg-primary-60 px-8 py-4 text-xs text-primary-30">
                  {t('endDate')}: {new Date(activeFilters.dateRange.end).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <TransactionFilterDialog
        isOpen={isFilterDialogOpen}
        onClose={handleCloseFilter}
        onApplyFilters={onApplyFilters}
        activeFilters={activeFilters}
      />

      <InfiniteScroll
        items={transactions}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        loader={<DotsLoader showLoadingText />}
        error={error && t('loadingTransactionsError')}
        endMessage={
          <p className="py-32 text-center text-sm text-gray-50">
            {transactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={renderTxItem}
      />
    </>
  )
}
