import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Infocon } from '@app/assets/icons'
import { PaginationBar, Select, Tooltip } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import useLatestTransactions, { MAX_TRANSACTION_RESULTS } from '../../hooks/useLatestTransactions'
import { TransactionRow, TransactionSkeletonRow } from '../../../components'
import { parseFilterApiError } from './filterUtils'
import TransactionFiltersBar from './TransactionFiltersBar'

const DEFAULT_PAGE_SIZE = 20
const COLUMN_COUNT = 8

const PAGE_SIZE_OPTIONS = [
  { i18nKey: 'showItemsPerPage', value: '10' },
  { i18nKey: 'showItemsPerPage', value: '20' },
  { i18nKey: 'showItemsPerPage', value: '50' }
]

const SkeletonRows = memo(({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <TransactionSkeletonRow key={`skeleton-${index}`} />
    ))}
  </>
))

type Props = {
  addressId: string
}

export default function LatestTransactions({ addressId }: Props) {
  const { t } = useTranslation('network-page')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const { transactions, totalCount, isLoading, error, applyFilters, clearFilters, activeFilters } =
    useLatestTransactions(addressId, page, pageSize)

  const pageSizeOptions = useMemo(
    () =>
      PAGE_SIZE_OPTIONS.map((option) => ({
        label: t(option.i18nKey, { count: parseInt(option.value, 10) }),
        value: option.value
      })),
    [t]
  )

  const defaultPageSizeOption = useMemo(
    () => pageSizeOptions.find((option) => option.value === String(pageSize)),
    [pageSizeOptions, pageSize]
  )

  // Parse API error to show localized message
  const errorMessage = useMemo(() => {
    if (!error) return null
    const parsed = parseFilterApiError(error)
    if (parsed) {
      return t(parsed.messageKey, { address: parsed.address || '' })
    }
    return t('loadingTransactionsError')
  }, [error, t])

  const pageCount = totalCount !== null ? Math.ceil(totalCount / pageSize) : 0

  const handlePageChange = useCallback((value: number) => {
    setPage(value)
  }, [])

  const handlePageSizeChange = useCallback((option: Option) => {
    setPageSize(parseInt(option.value, 10))
    setPage(1)
  }, [])

  const handleApplyFilters = useCallback(
    (filters: Parameters<typeof applyFilters>[0]) => {
      applyFilters(filters)
      setPage(1)
    },
    [applyFilters]
  )

  const handleClearFilters = useCallback(() => {
    clearFilters()
    setPage(1)
  }, [clearFilters])

  const renderTableContent = useCallback(() => {
    if (isLoading) {
      return <SkeletonRows count={pageSize} />
    }

    if (errorMessage) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="px-16 py-32 text-center text-sm text-error-40">
            {errorMessage}
          </td>
        </tr>
      )
    }

    if (transactions.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="px-16 py-32 text-center text-sm text-gray-50">
            {t('noTransactions')}
          </td>
        </tr>
      )
    }

    return transactions.map((tx) => (
      <TransactionRow key={tx.hash} tx={tx} highlightAddress={addressId} />
    ))
  }, [isLoading, errorMessage, transactions, pageSize, t, addressId])

  return (
    <div className="flex w-full flex-col gap-10">
      <TransactionFiltersBar
        addressId={addressId}
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <div className="flex flex-wrap items-end justify-between gap-8">
        {totalCount !== null && totalCount > 0 ? (
          <div className="flex items-center text-sm text-gray-50">
            {totalCount >= MAX_TRANSACTION_RESULTS ? (
              <>
                <span>
                  {t('showingMaxTransactions', {
                    count: MAX_TRANSACTION_RESULTS.toLocaleString()
                  } as Record<string, string>)}
                </span>
                <Tooltip
                  tooltipId="max-results-info"
                  content={t('maxResultsHint', {
                    count: MAX_TRANSACTION_RESULTS.toLocaleString()
                  } as Record<string, string>)}
                >
                  <Infocon className="ml-6 h-16 w-16 cursor-help text-gray-50" />
                </Tooltip>
              </>
            ) : (
              <span>
                {t('transactionsFound', { count: totalCount.toLocaleString() } as Record<
                  string,
                  string
                >)}
              </span>
            )}
          </div>
        ) : (
          <span />
        )}
        <Select
          className="w-[170px]"
          label={t('itemsPerPage')}
          defaultValue={defaultPageSizeOption}
          onSelect={handlePageSizeChange}
          options={pageSizeOptions}
        />
      </div>

      <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
              <tr>
                <th className="whitespace-nowrap px-8 py-12 text-center font-400 sm:px-16">
                  {t('status')}
                </th>
                <th className="whitespace-nowrap px-8 py-12 font-400 sm:px-16">{t('txID')}</th>
                <th className="whitespace-nowrap px-8 py-12 font-400 sm:px-16">{t('type')}</th>
                <th className="whitespace-nowrap px-8 py-12 font-400 sm:px-16">{t('tick')}</th>
                <th className="whitespace-nowrap px-8 py-12 font-400 sm:px-16">{t('timestamp')}</th>
                <th className="whitespace-nowrap px-8 py-12 font-400 sm:px-16">{t('source')}</th>
                <th className="whitespace-nowrap px-8 py-12 font-400 sm:px-16">
                  {t('destination')}
                </th>
                <th className="whitespace-nowrap px-8 py-12 text-right font-400 sm:px-16">
                  {t('amount')}
                </th>
              </tr>
            </thead>
            <tbody>{renderTableContent()}</tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <PaginationBar
            className="mx-auto w-fit gap-8 p-20"
            pageCount={pageCount}
            page={page}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}
