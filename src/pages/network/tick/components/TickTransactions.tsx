import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Infocon } from '@app/assets/icons'
import { PageSizeSelect, PaginationBar, Tooltip } from '@app/components/ui'
import { usePaginationSearchParams, useValidatedPage, useValidatedPageSize } from '@app/hooks'
import { useGetTickDataQuery, useGetTransactionsForTickQuery } from '@app/store/apis/query-service'
import { parseTickTransactionFilters, tickTxFiltersToParams } from '../../utils/txFilterParams'
import { updateSearchParams } from '../../utils/filterUtils'
import TickTransactionFiltersBar from './TickTransactionFiltersBar'
import { TransactionRow, TransactionSkeletonRow } from '../../components'
import type { TickTransactionFilters } from './tickFilterUtils'
import {
  buildTickTransactionsRequest,
  extractErrorMessage,
  hasActiveFilters,
  parseFilterApiError,
  parseLastProcessedTickFromMessage
} from './tickFilterUtils'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const { handlePageChange, handlePageSizeChange } = usePaginationSearchParams()
  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()

  // Read filters from URL search params (source of truth)
  // No reference stabilization needed: RTK Query caches by serialized args, not by reference
  const activeFilters = useMemo(() => parseTickTransactionFilters(searchParams), [searchParams])

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

  // Shares RTK Query cache with TickDetails (same args), so this triggers no extra request.
  // The tick's on-chain transaction hash count is the source of truth for the total, while
  // getTransactionsForTick can return fewer rows because ephemeral transactions are pruned.
  const { data: tickData, isFetching: isTickDataLoading } = useGetTickDataQuery(tick, {
    skip: !tick
  })
  const onChainTransactionsCount = tickData?.transactionHashes?.length ?? 0

  // Extract error message from RTK Query error
  const errorMessage = useMemo(() => {
    if (!tickTransactionsError) return null
    const lastProcessedTick = parseLastProcessedTickFromMessage(tickTransactionsError)
    if (lastProcessedTick !== null) {
      return t('tickNotYetProcessedTransactions', {
        lastProcessedTick: lastProcessedTick.toLocaleString()
      })
    }
    const errorStr = extractErrorMessage(tickTransactionsError)
    const parsed = parseFilterApiError(errorStr)
    if (parsed) {
      return t(parsed.messageKey, { address: parsed.address || '' })
    }
    return errorStr
  }, [tickTransactionsError, t])

  const totalCount = transactions?.length ?? 0
  const pageCount = Math.ceil(totalCount / pageSize)

  // Show a notice when fewer transactions are available than the tick actually contains.
  // Only meaningful with no active filters, where a lower count means data was pruned
  // (with filters, a lower count is the expected result of filtering).
  const showPrunedNotice =
    !isTickTransactionsLoading &&
    !isTickDataLoading &&
    !errorMessage &&
    !hasActiveFilters(activeFilters) &&
    onChainTransactionsCount > 0 &&
    totalCount < onChainTransactionsCount

  // Render the count line whenever there are transactions to show, or when every
  // transaction was pruned (totalCount === 0 but the tick had transactions on chain),
  // so the pruned notice still appears in that all-pruned case.
  const showTransactionsCount = (!isTickTransactionsLoading && totalCount > 0) || showPrunedNotice

  // Clamp page to valid range when it exceeds pageCount (e.g. manually edited URL)
  useEffect(() => {
    if (pageCount > 0 && page > pageCount) {
      handlePageChange(pageCount)
    }
  }, [page, pageCount, handlePageChange])

  const paginatedTransactions = useMemo(() => {
    if (!transactions) return []
    const start = (page - 1) * pageSize
    return transactions.slice(start, start + pageSize)
  }, [transactions, page, pageSize])

  const handleApplyFilters = useCallback(
    (filters: TickTransactionFilters) => {
      setSearchParams((prev) => updateSearchParams(prev, tickTxFiltersToParams(filters)), {
        replace: true
      })
    },
    [setSearchParams]
  )

  const handleClearFilters = useCallback(() => {
    setSearchParams((prev) => updateSearchParams(prev, tickTxFiltersToParams({})), {
      replace: true
    })
  }, [setSearchParams])

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

      <div className="flex flex-wrap items-center justify-between gap-8">
        {showTransactionsCount ? (
          <span className="flex items-center text-sm text-gray-50">
            {t('transactionsFound', {
              count: totalCount.toLocaleString()
            } as Record<string, string>)}
            {showPrunedNotice && (
              <Tooltip
                tooltipId="tick-transactions-pruned-info"
                maxWidth="320px"
                content={t('tickTransactionsPruned', {
                  total: onChainTransactionsCount.toLocaleString()
                } as Record<string, string>)}
              >
                <Infocon className="ml-6 size-16 shrink-0 cursor-help text-gray-50" />
              </Tooltip>
            )}
          </span>
        ) : (
          <span />
        )}
        <PageSizeSelect pageSize={pageSize} onSelect={handlePageSizeChange} />
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
