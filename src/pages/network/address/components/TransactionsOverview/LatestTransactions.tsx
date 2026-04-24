import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { ArrowDownTrayIcon, Infocon } from '@app/assets/icons'
import { PageSizeSelect, PaginationBar, Tooltip } from '@app/components/ui'
import { usePaginationSearchParams, useValidatedPage, useValidatedPageSize } from '@app/hooks'
import { Routes } from '@app/router'
import { useGetProtocolQuery } from '@app/store/apis/qubic-static'
import useLatestTransactions, { MAX_TRANSACTION_RESULTS } from '../../hooks/useLatestTransactions'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'
import { TransactionRow, TransactionSkeletonRow } from '../../../components'
import { buildCsvFilename, downloadCsv, transactionsToCsv } from '../../../tools/csvUtils'
import { parseTransactionFilters, txFiltersToParams } from '../../../utils/txFilterParams'
import { updateSearchParams } from '../../../utils/filterUtils'
import { parseFilterApiError } from './filterUtils'
import TransactionFiltersBar from './TransactionFiltersBar'

const COLUMN_COUNT = 8

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
  const [searchParams, setSearchParams] = useSearchParams()
  const { handlePageChange, handlePageSizeChange } = usePaginationSearchParams()
  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()

  // Read filters from URL search params (source of truth)
  // Stabilize reference: only produce a new object when the serialized filter values actually change
  // (useLatestTransactions uses useEffect with activeFilters as a dep, so reference stability matters)
  const filtersJson = useMemo(
    () => JSON.stringify(parseTransactionFilters(searchParams)),
    [searchParams]
  )
  const activeFilters: TransactionFilters = useMemo(() => JSON.parse(filtersJson), [filtersJson])

  const { data: protocolData } = useGetProtocolQuery()

  const { transactions, totalCount, isLoading, error } = useLatestTransactions(
    addressId,
    page,
    pageSize,
    activeFilters
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

  // Clamp page to valid range when it exceeds pageCount (e.g. manually edited URL)
  useEffect(() => {
    if (pageCount > 0 && page > pageCount) {
      handlePageChange(pageCount)
    }
  }, [page, pageCount, handlePageChange])

  const handleApplyFilters = useCallback(
    (filters: TransactionFilters) => {
      setSearchParams((prev) => updateSearchParams(prev, txFiltersToParams(filters)), {
        replace: true
      })
    },
    [setSearchParams]
  )

  const handleDownloadPageData = useCallback(() => {
    if (transactions.length === 0) return
    const csv = transactionsToCsv(transactions, protocolData)
    downloadCsv(csv, buildCsvFilename(`transactions_page${page}`, addressId))
  }, [transactions, protocolData, addressId, page])

  const handleClearFilters = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, txFiltersToParams({})), { replace: true })
  }, [setSearchParams])

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

      <div className="flex flex-wrap items-center justify-between gap-8">
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
        <div className="flex items-center gap-8">
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadPageData}
              className="flex items-center gap-4 font-space text-xs text-primary-30 hover:text-primary-40"
            >
              [ {t('downloadPageData')} <ArrowDownTrayIcon className="h-14 w-14" /> ]
            </button>
          )}
          <PageSizeSelect pageSize={pageSize} onSelect={handlePageSizeChange} />
        </div>
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

      {totalCount !== null && totalCount > 0 && (
        <div className="flex justify-end">
          <Link
            to={`${Routes.NETWORK.TOOLS.CSV_EXPORT}?address=${addressId}`}
            className="flex items-center gap-6 font-space text-xs text-primary-30 hover:text-primary-40"
          >
            [ {t('csvExportPageTitle')} <ArrowDownTrayIcon className="h-14 w-14" /> ]
          </Link>
        </div>
      )}
    </div>
  )
}
