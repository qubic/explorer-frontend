import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PaginationBar, Select } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { useGetTransactionsForTickQuery } from '@app/store/apis/query-service'
import TickTransactionFiltersBar from './TickTransactionFiltersBar'
import { TransactionRow, TransactionSkeletonRow } from '../../components'
import type { TickTransactionFilters } from './tickFilterUtils'
import {
  buildTickTransactionsRequest,
  extractErrorMessage,
  parseFilterApiError
} from './tickFilterUtils'

const DEFAULT_PAGE_SIZE = 20

const PAGE_SIZE_OPTIONS = [
  { i18nKey: 'showItemsPerPage', value: '10' },
  { i18nKey: 'showItemsPerPage', value: '20' },
  { i18nKey: 'showItemsPerPage', value: '50' }
]

const TickTransactionsSkeletonRows = memo(({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <TransactionSkeletonRow key={`skeleton-${index}`} />
    ))}
  </>
))

type Props = Readonly<{
  tick: number
}>

export default function TickTransactions({ tick }: Props) {
  const { t } = useTranslation('network-page')
  const [activeFilters, setActiveFilters] = useState<TickTransactionFilters>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

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

  // Build the API request with filters
  const request = useMemo(
    () => buildTickTransactionsRequest(tick, activeFilters),
    [tick, activeFilters]
  )

  const {
    data: transactions,
    isFetching: isTickTransactionsLoading,
    error: tickTransactionsError
  } = useGetTransactionsForTickQuery(request, { skip: !tick })

  // Extract error message from RTK Query error
  const errorMessage = useMemo(() => {
    if (!tickTransactionsError) return null
    const errorStr = extractErrorMessage(tickTransactionsError)
    const parsed = parseFilterApiError(errorStr)
    if (parsed) {
      return t(parsed.messageKey, { address: parsed.address || '' })
    }
    return errorStr
  }, [tickTransactionsError, t])

  const totalCount = transactions?.length ?? 0
  const pageCount = Math.ceil(totalCount / pageSize)

  const paginatedTransactions = useMemo(() => {
    if (!transactions) return []
    const start = (page - 1) * pageSize
    return transactions.slice(start, start + pageSize)
  }, [transactions, page, pageSize])

  const handlePageChange = useCallback((value: number) => {
    setPage(value)
  }, [])

  const handlePageSizeChange = useCallback((option: Option) => {
    setPageSize(parseInt(option.value, 10))
    setPage(1)
  }, [])

  const handleApplyFilters = useCallback((filters: TickTransactionFilters) => {
    setActiveFilters(filters)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setActiveFilters({})
    setPage(1)
  }, [])

  const renderTableContent = useCallback(() => {
    if (isTickTransactionsLoading) {
      return <TickTransactionsSkeletonRows count={pageSize} />
    }

    if (errorMessage) {
      return (
        <tr>
          <td colSpan={8} className="px-16 py-32 text-center text-sm text-error-40">
            {errorMessage}
          </td>
        </tr>
      )
    }

    if (paginatedTransactions.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="px-16 py-32 text-center text-sm text-gray-50">
            {t('noTransactions')}
          </td>
        </tr>
      )
    }

    return paginatedTransactions.map((tx) => (
      <TransactionRow key={tx.hash} tx={tx} highlightTick={tick} />
    ))
  }, [isTickTransactionsLoading, errorMessage, paginatedTransactions, pageSize, t, tick])

  return (
    <div className="flex flex-col gap-16">
      <TickTransactionFiltersBar
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <div className="flex flex-wrap items-end justify-between gap-8">
        {totalCount > 0 ? (
          <span className="text-sm text-gray-50">
            {t('transactionsFound', {
              count: totalCount.toLocaleString()
            } as Record<string, string>)}
          </span>
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
                <th className="whitespace-nowrap px-8 py-12 font-400 sm:px-16">{t('txType')}</th>
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
